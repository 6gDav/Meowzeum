import { Hono, type Context } from 'hono'
import { getSessionUser } from '../auth/helper/getSession'
import { turso } from '../auth/helper/tursoClient.ts'
import { use } from 'hono/jsx'

/*type PostRow = {
    id: string
    author_id: number
    imageUrl: string
    caption: string
    createdAt: string
}*/

const postQuery = `SELECT
    p.id,
    p.author_id,
    u.firstName,
    u.lastName,
    u.picture AS avatar,
    p.image_url AS imageUrl,
    p.caption,
    p.created_at AS createdAt,
    COUNT(l.visitor_id) AS likeCount,
    COALESCE(MAX(CASE WHEN l.visitor_id = ? THEN 1 ELSE 0 END), 0) AS likedByViewer
FROM cat_posts p
JOIN users u ON u.id = p.author_id
LEFT JOIN cat_post_likes l ON l.post_id = p.id`

function pictureToBase64(value: unknown): string | null
{
    if (value instanceof ArrayBuffer) return Buffer.from(value).toString('base64')
    if (value instanceof Uint8Array) return Buffer.from(value).toString('base64')
    return null
}

function isRecord(value: unknown): value is Record<string, unknown>
{
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validImageUrl(value: unknown): value is string
{
    if (typeof value !== 'string' || value.length > 2048) return false

    try
    {
        return new URL(value).protocol === 'https:'
    }
    catch
    {
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
        const sessionResult = await getSessionUser(c)
        const userId = typeof sessionResult === 'number' ? sessionResult : null
        const cursor = c.req.query('cursor')
        const requestedLimit = Number(c.req.query('limit') ?? 8)

        if ((cursor !== undefined && cursor.length > 128))
        {
            return c.json({ error: 'Invalid feed cursor.' }, 400)
        }

        const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 20) : 8
        const result = await turso.execute({
            sql: `${postQuery}
                WHERE (? IS NULL OR p.created_at < (
                    SELECT created_at FROM cat_posts WHERE id = ?
                ) OR (p.created_at = (
                    SELECT created_at FROM cat_posts WHERE id = ?
                ) AND p.id < ?))
                GROUP BY p.id
                ORDER BY p.created_at DESC, p.id DESC
                LIMIT ?`,
            args: [userId, cursor ?? null, cursor ?? null, cursor ?? null, cursor ?? null, limit + 1],
        });
        const rows = result.rows

        const hasMore = rows.length > limit
        const posts = rows.slice(0, limit).map((post) => {
            const id = Number(post.id)
            return {
                id,
                author: `${String(post.firstName)} ${String(post.lastName)}`,
                avatar: pictureToBase64(post.avatar),
                imageUrl: String(post.imageUrl),
                caption: String(post.caption ?? ''),
                createdAt: String(post.createdAt),
                likeCount: Number(post.likeCount ?? 0),
                likedByViewer: Boolean(post.likedByViewer),
            }
        })

        return c.json({
            posts,
            nextCursor: hasMore ? posts[posts.length - 1]?.id ?? null : null,
        })
    })
    
    // create new post
    router.post('/community/posts', async (c) => {
        const sessionResult = await getSessionUser(c)
        const userId = typeof sessionResult === 'number' ? sessionResult : null

        if (!userId) return c.json({ error: 'Sign in to create community posts.' }, 401)

        if (!c.req.header('content-type')?.includes('application/json'))
        {
            return c.json({ error: 'Content-Type must be application/json.' }, 415)
        }

        const result = await turso.execute({
            sql: `SELECT id, firstName, lastName, picture FROM users WHERE id = ?`,
            args: [userId],
        });
        const user = result.rows[0];
        if (!user) return c.json({ error: 'Sign in to create community posts.' }, 401)

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
        const caption = typeof body?.caption === 'string' ? body.caption.trim() : ''
        const imageUrl = body?.imageUrl
        
        // parameter validation
        if (!validImageUrl(imageUrl)) return c.json({ error: 'Please provide a valid HTTPS image URL.' }, 400)
        if (caption.length > 500) return c.json({ error: 'Caption must be 500 characters or fewer.' }, 400)

        const post = {
          author: `${String(user.firstName)} ${String(user.lastName)}`,
          avatar: pictureToBase64(user.picture),
          imageUrl,
          caption,
          createdAt: new Date().toISOString(),
        }
        
        // execute
        const insertResult = await turso.execute({
            sql: `INSERT INTO cat_posts (author_id, image_url, caption, created_at) VALUES (?, ?, ?, ?)`,
            args: [userId, post.imageUrl, post.caption, post.createdAt],
        });

        const id = typeof insertResult.lastInsertRowid === 'bigint'
            ? Number(insertResult.lastInsertRowid)
            : Number(insertResult.lastInsertRowid)

        return c.json({
            post: {
                id,
                author: post.author,
                avatar: post.avatar,
                imageUrl: post.imageUrl,
                caption: post.caption,
                createdAt: post.createdAt,
                likeCount: 0,
                likedByViewer: false,
            },
        }, 201)
    })

    // like or unlike post by id
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

        const sessionResult = await getSessionUser(c)
        const userId = typeof sessionResult === 'number' ? sessionResult : null

        if (!userId) return c.json({ error: 'Sign in to like community posts.' }, 401)
        if (typeof liked !== 'boolean') return c.json({ error: 'A valid like state is required.' }, 400)

        const user_result = await turso.execute({
            sql: `SELECT id FROM users WHERE id = ?`,
            args: [userId],
        })
        const user = await user_result.rows[0]
        if (!user) return c.json({ error: 'Sign in to like community posts.' }, 401)

        const result = await turso.execute({
            sql: `SELECT id FROM cat_posts WHERE id = ?`,
            args: [postId],
        });
        const post = result.rows[0]
        if (!post) return c.json({ error: 'Post not found.' }, 404)

        if (liked)
        {
            await turso.execute({
                sql: `INSERT INTO cat_post_likes (post_id, visitor_id, created_at)
                VALUES (?, ?, ?)
                ON CONFLICT (post_id, visitor_id) DO NOTHING`,
                args: [postId, userId, new Date().toISOString()],
            });
        }
        else
        {
            await turso.execute({
                sql: `DELETE FROM cat_post_likes WHERE post_id = ? AND visitor_id = ?`,
                args: [postId, userId],
            });
        }
        
        // get like count for display
        const like_result = await turso.execute({
            sql: `SELECT COUNT(*) AS likeCount FROM cat_post_likes WHERE post_id = ?`,
            args: [postId],
        });
        const likeCount = Number(like_result.rows[0]?.likeCount ?? 0)

        return c.json({ liked, likeCount })
    })

    // edit the caption of your own post
    const editPostCaption = async (c: Context) => {
        const postId = c.req.param('id')

        const sessionResult = await getSessionUser(c)
        const userId = typeof sessionResult === 'number' ? sessionResult : null

        if (!userId) return c.json({ error: 'Sign in to edit community posts.' }, 401)

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
        if (typeof body?.caption !== 'string') return c.json({ error: 'A valid caption is required.' }, 400)

        const caption = body.caption.trim()
        if (caption.length > 500) return c.json({ error: 'Caption must be 500 characters or fewer.' }, 400)

        const user_result = await turso.execute({
            sql: `SELECT id FROM users WHERE id = ?`,
            args: [userId],
        })
        const user = await user_result.rows[0]
        if (!user) return c.json({ error: 'Sign in to edit community posts.' }, 401)

        if (!postId) return c.json({ error: 'Post not found.' }, 404)

        const post_result = await turso.execute({
            sql: `SELECT id,_id FROM cat_posts WHERE id = ?`,
            args: [postId],
        })
        const post = post_result.rows[0];
        if (!post) return c.json({ error: 'Post not found.' }, 404)
        if (String(post.author_id) !== String(userId)) return c.json({ error: 'You can only edit your own posts.' }, 403)

        await turso.execute({
            sql: `UPDATE cat_posts SET caption = ? WHERE id = ?`,
            args: [caption, postId],
        })

        return c.json({
            message: 'Post caption updated successfully.',
            caption,
            post: { id: postId, caption },
        })
    }
    router.put('/community/posts/:id/caption', editPostCaption)
    router.patch('/community/posts/:id/caption', editPostCaption)
    router.put('/community/posts/:id', editPostCaption)
    router.patch('/community/posts/:id', editPostCaption)

    // delete own post by id
    router.delete('/community/posts/:id', async (c) => {
        const postId = c.req.param('id')
        if (!postId) return c.json({ error: 'Post not found.' }, 404)

        const sessionResult = await getSessionUser(c)
        const userId = typeof sessionResult === 'number' ? sessionResult : null

        if (!userId) return c.json({ error: 'Sign in to delete community posts.' }, 401)
        
        const user_result = await turso.execute({
            sql: `SELECT id FROM users WHERE id = ?`,
            args: [userId],
        })
        const user = await user_result.rows[0]
        if (!user) return c.json({ error: 'Sign in to delete community posts.' }, 401)

        const posts_result = await turso.execute({
            sql: `SELECT id,author_id FROM cat_posts WHERE id = ?`,
            args: [postId],
        })
        const post = posts_result.rows[0]

        // ha a poszt nem létezik
        if (!post) return c.json({ error: 'Post not found.' }, 404)
        
        // ha az user nem author_id, hiba
        if (String(post.author_id) !== String(userId)) return c.json({ error: 'You can only delete your own posts.' }, 403)

        await turso.execute({
            sql: `DELETE FROM cat_post_likes WHERE post_id = ?`,
            args: [postId],
        })
        await turso.execute({
            sql: `DELETE FROM cat_posts WHERE id = ?`,
            args: [postId],
        })

        return c.json({ message: 'Post deleted successfully.' })
    })

    return router
}
