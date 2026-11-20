import { Hono } from 'hono'
import { db } from '../db'
import { getSessionUserId } from '../authSession'

/*type PostRow = {
    id: string
    author: number
    imageUrl: string
    caption: string
    createdAt: string
}*/

const postQuery = `SELECT
    p.id,
    p.author,
    p.image_url AS imageUrl,
    p.caption,
    p.created_at AS createdAt,
    COUNT(l.visitor_id) AS likeCount,
    COALESCE(MAX(CASE WHEN l.visitor_id = ? THEN 1 ELSE 0 END), 0) AS likedByViewer
FROM cat_posts p
LEFT JOIN cat_post_likes l ON l.post_id = p.id`

function isRecord(value: unknown): value is Record<string, unknown>
{
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validImageUrl(value: unknown): value is string
{
    if (typeof value !== 'string' || value.length > 2048) return false

    try {
        return new URL(value).protocol === 'https:'
    }
    catch {
        return false
    }
}

function parseJsonBody(value: unknown): Record<string, unknown> | null
{
    return isRecord(value) ? value : null
}

export function createCommunityRouter()
{
    const router = new Hono()

    // get posts with optional cursor and limit query parameters
    router.get('/community/posts', async (c) => {
        const sessionUserId = getSessionUserId(c.req.header('cookie'))
        let viewerUserId: number | null = null
        if (sessionUserId) {
            const user = await (await db.prepare('SELECT id FROM users WHERE id = ?')).get([sessionUserId])
            if (user) viewerUserId = sessionUserId
        }
        const cursor = c.req.query('cursor')
        const requestedLimit = Number(c.req.query('limit') ?? 8)

        if ((cursor !== undefined && cursor.length > 128))
        {
            return c.json({ error: 'Invalid feed cursor.' }, 400)
        }

        const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 20) : 8
        const conn = await db.prepare(`${postQuery}
            WHERE (? IS NULL OR p.created_at < (
                SELECT created_at FROM cat_posts WHERE id = ?
            ) OR (p.created_at = (
                SELECT created_at FROM cat_posts WHERE id = ?
            ) AND p.id < ?))
            GROUP BY p.id
            ORDER BY p.created_at DESC, p.id DESC
            LIMIT ?`)
        const rows = await conn.all([viewerUserId, cursor ?? null, cursor ?? null, cursor ?? null, cursor ?? null, limit + 1])

        const hasMore = rows.length > limit
        const posts = rows.slice(0, limit).map((post) => ({
            ...post,
            likedByViewer: Boolean(post.likedByViewer),
        }))

        return c.json({
            posts,
            nextCursor: hasMore ? posts[posts.length - 1]?.id ?? null : null,
        })
    })
    
    // create new post
    router.post('/community/posts', async (c) => {
        const sessionUserId = getSessionUserId(c.req.header('cookie'))
        if (!sessionUserId) return c.json({ error: 'Sign in to create community posts.' }, 401)

        const user = await (await db.prepare('SELECT id FROM users WHERE id = ?')).get([sessionUserId])
        if (!user) return c.json({ error: 'Sign in to create community posts.' }, 401)

        if (!c.req.header('content-type')?.includes('application/json'))
        {
            return c.json({ error: 'Content-Type must be application/json.' }, 415)
        }

        let rawBody: unknown
        try
        {
            rawBody = await c.req.json()
        }
        catch
        {
          return c.json({ error: 'Request body must be valid JSON.' }, 400)
        }

        const body = parseJsonBody(rawBody)
        const author = typeof body?.author === 'string' ? body.author.trim() : ''
        const caption = typeof body?.caption === 'string' ? body.caption.trim() : ''
        const imageUrl = body?.imageUrl
        
        // parameter validation
        if (!author || author.length > 40) return c.json({ error: 'Author must be between 1 and 40 characters.' }, 400)
        if (!validImageUrl(imageUrl)) return c.json({ error: 'Please provide a valid HTTPS image URL.' }, 400)
        if (caption.length > 500) return c.json({ error: 'Caption must be 500 characters or fewer.' }, 400)

        const post = {
          author,
          imageUrl,
          caption,
          createdAt: new Date().toISOString(),
        }
        
        // execute
        const conn3 = await db.prepare(`INSERT INTO cat_posts (author, image_url, caption, created_at) VALUES (?, ?, ?, ?)`)
        await conn3.run([post.author, post.imageUrl, post.caption, post.createdAt])

        return c.json({ post: { ...post, likeCount: 0, likedByViewer: false } }, 201)
    })

    // like or unlike post
    router.put('/community/posts/:id/like', async (c) => {
      if (!c.req.header('content-type')?.includes('application/json')) return c.json({ error: 'Content-Type must be application/json.' }, 415)

      let rawBody: unknown
      try
      {
        rawBody = await c.req.json()
      }
      catch
      {
          return c.json({ error: 'Request body must be valid JSON.' }, 400)
      }

      const body = parseJsonBody(rawBody)
      const liked = body?.liked
      const postId = c.req.param('id')

      const sessionUserId = getSessionUserId(c.req.header('cookie'))
      if (!sessionUserId) return c.json({ error: 'Sign in to like community posts.' }, 401)
      if (typeof liked !== 'boolean') return c.json({ error: 'A valid like state is required.' }, 400)

      const user = await (await db.prepare('SELECT id FROM users WHERE id = ?')).get([sessionUserId])
      if (!user) return c.json({ error: 'Sign in to like community posts.' }, 401)

      const conn = await db.prepare('SELECT id FROM cat_posts WHERE id = ?',)
      const postExists = await conn.get([postId])
      if (!postExists) return c.json({ error: 'Post not found.' }, 404)

      if (liked)
      {
          const conn = await db.prepare(`INSERT INTO cat_post_likes (post_id, visitor_id, created_at)
              VALUES (?, ?, ?)
              ON CONFLICT (post_id, visitor_id) DO NOTHING`)
          await conn.run([postId, sessionUserId, new Date().toISOString()])
      }
      else
      {
          const conn = await db.prepare('DELETE FROM cat_post_likes WHERE post_id = ? AND visitor_id = ?')
          await conn.run([postId, sessionUserId])
      }
      
      // get like count for display
      const conn2 = await db.prepare('SELECT COUNT(*) AS likeCount FROM cat_post_likes WHERE post_id = ?')
      const likeCount = await conn2.get([postId]) ?? 0

      return c.json({ liked, likeCount })
    })

    return router
}
