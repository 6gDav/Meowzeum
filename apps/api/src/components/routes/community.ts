import { Hono } from 'hono'
import type { Database } from 'bun:sqlite'

type PostRow = {
  id: string
  author: string
  imageUrl: string
  caption: string
  createdAt: string
  likeCount: number
  likedByViewer: number
}

const postQuery = `
  SELECT
    p.id,
    p.author,
    p.image_url AS imageUrl,
    p.caption,
    p.created_at AS createdAt,
    COUNT(l.visitor_id) AS likeCount,
    COALESCE(MAX(CASE WHEN l.visitor_id = ? THEN 1 ELSE 0 END), 0) AS likedByViewer
  FROM cat_posts p
  LEFT JOIN cat_post_likes l ON l.post_id = p.id
`

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validImageUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false

  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function parseJsonBody(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null
}

export function createCommunityRouter(database: Database) {
  const router = new Hono()

  router.get('/community/posts', (c) => {
    const viewerId = c.req.query('viewerId') ?? ''
    const cursor = c.req.query('cursor')
    const requestedLimit = Number(c.req.query('limit') ?? 8)

    if (viewerId.length > 128 || (cursor !== undefined && cursor.length > 128)) {
      return c.json({ error: 'Invalid feed cursor or viewer id.' }, 400)
    }

    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 20)
      : 8
    const rows = database.query<PostRow, [string, string | null, string | null, string | null, string | null, number]>(`
      ${postQuery}
      WHERE (? IS NULL OR p.created_at < (
        SELECT created_at FROM cat_posts WHERE id = ?
      ) OR (p.created_at = (
        SELECT created_at FROM cat_posts WHERE id = ?
      ) AND p.id < ?))
      GROUP BY p.id
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT ?
    `).all(viewerId, cursor ?? null, cursor ?? null, cursor ?? null, cursor ?? null, limit + 1)

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

  router.post('/community/posts', async (c) => {
    if (!c.req.header('content-type')?.includes('application/json')) {
      return c.json({ error: 'Content-Type must be application/json.' }, 415)
    }

    let rawBody: unknown
    try {
      rawBody = await c.req.json()
    } catch {
      return c.json({ error: 'Request body must be valid JSON.' }, 400)
    }

    const body = parseJsonBody(rawBody)
    const author = typeof body?.author === 'string' ? body.author.trim() : ''
    const caption = typeof body?.caption === 'string' ? body.caption.trim() : ''
    const imageUrl = body?.imageUrl

    if (!author || author.length > 40) {
      return c.json({ error: 'Display name must be between 1 and 40 characters.' }, 400)
    }
    if (!validImageUrl(imageUrl)) {
      return c.json({ error: 'Please provide a valid HTTPS image URL.' }, 400)
    }
    if (caption.length > 500) {
      return c.json({ error: 'Caption must be 500 characters or fewer.' }, 400)
    }

    const post = {
      id: crypto.randomUUID(),
      author,
      imageUrl,
      caption,
      createdAt: new Date().toISOString(),
    }

    database.query(`
      INSERT INTO cat_posts (id, author, image_url, caption, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(post.id, post.author, post.imageUrl, post.caption, post.createdAt)

    return c.json({ post: { ...post, likeCount: 0, likedByViewer: false } }, 201)
  })

  router.put('/community/posts/:id/like', async (c) => {
    if (!c.req.header('content-type')?.includes('application/json')) {
      return c.json({ error: 'Content-Type must be application/json.' }, 415)
    }

    let rawBody: unknown
    try {
      rawBody = await c.req.json()
    } catch {
      return c.json({ error: 'Request body must be valid JSON.' }, 400)
    }

    const body = parseJsonBody(rawBody)
    const viewerId = typeof body?.viewerId === 'string' ? body.viewerId.trim() : ''
    const liked = body?.liked
    const postId = c.req.param('id')

    if (!viewerId || viewerId.length > 128 || typeof liked !== 'boolean') {
      return c.json({ error: 'A valid viewer id and like state are required.' }, 400)
    }

    const postExists = database.query<{ id: string }, [string]>(
      'SELECT id FROM cat_posts WHERE id = ?',
    ).get(postId)
    if (!postExists) {
      return c.json({ error: 'Post not found.' }, 404)
    }

    if (liked) {
      database.query(`
        INSERT INTO cat_post_likes (post_id, visitor_id, created_at)
        VALUES (?, ?, ?)
        ON CONFLICT (post_id, visitor_id) DO NOTHING
      `).run(postId, viewerId, new Date().toISOString())
    } else {
      database.query(
        'DELETE FROM cat_post_likes WHERE post_id = ? AND visitor_id = ?',
      ).run(postId, viewerId)
    }

    const likeCount = database.query<{ likeCount: number }, [string]>(
      'SELECT COUNT(*) AS likeCount FROM cat_post_likes WHERE post_id = ?',
    ).get(postId)?.likeCount ?? 0

    return c.json({ liked, likeCount })
  })

  return router
}
