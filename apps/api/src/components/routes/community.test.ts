import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Database } from 'bun:sqlite'
import { initializeCommunitySchema } from '../communitySchema'
import { createCommunityRouter } from './community'

describe('community routes', () => {
  let database: Database
  let router: ReturnType<typeof createCommunityRouter>

  beforeEach(() => {
    database = new Database(':memory:')
    initializeCommunitySchema(database)
    router = createCommunityRouter(database)
  })

  afterEach(() => database.close())

  async function createPost(caption: string) {
    const response = await router.request('/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: 'Milo',
        imageUrl: 'https://images.example.com/cat.jpg',
        caption,
      }),
    })

    return response.json() as Promise<{
      post: { id: string; caption: string; likeCount: number }
    }>
  }

  it('stores posts and returns them in cursor-paginated feed pages', async () => {
    await createPost('First cat')
    await createPost('Second cat')
    await createPost('Third cat')

    const firstPageResponse = await router.request('/community/posts?limit=2&viewerId=visitor-1')
    const firstPage = await firstPageResponse.json() as {
      posts: Array<{ id: string; caption: string }>
      nextCursor: string | null
    }

    expect(firstPage.posts).toHaveLength(2)
    expect(firstPage.nextCursor).toBe(firstPage.posts[1]?.id)

    const nextPageResponse = await router.request(
      `/community/posts?limit=2&viewerId=visitor-1&cursor=${firstPage.nextCursor}`,
    )
    const nextPage = await nextPageResponse.json() as {
      posts: Array<{ caption: string }>
      nextCursor: string | null
    }

    expect(nextPage.posts).toHaveLength(1)
    expect(nextPage.nextCursor).toBeNull()
  })

  it('stores likes per visitor and makes like updates idempotent', async () => {
    const { post } = await createPost('A cozy nap')
    const likeUrl = `/community/posts/${post.id}/like`

    const likeRequest = () => router.request(likeUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewerId: 'visitor-1', liked: true }),
    })

    expect((await (await likeRequest()).json() as { likeCount: number }).likeCount).toBe(1)
    expect((await (await likeRequest()).json() as { likeCount: number }).likeCount).toBe(1)

    const feedResponse = await router.request('/community/posts?viewerId=visitor-1')
    const feed = await feedResponse.json() as {
      posts: Array<{ id: string; likeCount: number; likedByViewer: boolean }>
    }
    expect(feed.posts[0]).toMatchObject({
      id: post.id,
      likeCount: 1,
      likedByViewer: true,
    })

    const unlikeResponse = await router.request(likeUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewerId: 'visitor-1', liked: false }),
    })
    expect((await unlikeResponse.json() as { likeCount: number }).likeCount).toBe(0)
  })

  it('rejects non-HTTPS image URLs', async () => {
    const response = await router.request('/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: 'Milo',
        imageUrl: 'http://images.example.com/cat.jpg',
        caption: '',
      }),
    })

    expect(response.status).toBe(400)
  })

  it('requires JSON content for write requests', async () => {
    const response = await router.request('/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: '{"author":"Milo","imageUrl":"https://images.example.com/cat.jpg"}',
    })

    expect(response.status).toBe(415)
  })
})
