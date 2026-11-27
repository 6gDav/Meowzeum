import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockExecute = vi.fn()

vi.mock('../auth/helper/tursoClient.ts', () => ({
  turso: { execute: mockExecute },
}))

vi.mock('../authSession', () => ({
  getSessionUserId: () => 42,
}))

import { createCommunityRouter } from './community'

describe('community routes', () => {
  beforeEach(() => {
    mockExecute.mockReset()
  })

  it('rejects non-HTTPS image URLs', async () => {
    mockExecute.mockImplementation(async ({ sql }: { sql: string }) => {
      if (sql.startsWith('SELECT id FROM users')) return { rows: [{ id: 42 }] }
      return { rows: [], lastInsertRowid: 1n }
    })

    const response = await createCommunityRouter().request('/community/posts', {
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
    const response = await createCommunityRouter().request('/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: '{"author":"Milo","imageUrl":"https://images.example.com/cat.jpg"}',
    })

    expect(response.status).toBe(415)
  })

  it('creates a post through the Turso client', async () => {
    mockExecute.mockImplementation(async ({ sql }: { sql: string }) => {
      if (sql.startsWith('SELECT id FROM users')) return { rows: [{ id: 42 }] }
      if (sql.startsWith('INSERT INTO cat_posts')) return { rows: [], lastInsertRowid: 7n }
      return { rows: [] }
    })

    const response = await createCommunityRouter().request('/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: 'Milo',
        imageUrl: 'https://images.example.com/cat.jpg',
        caption: 'A cozy nap',
      }),
    })

    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({
      post: { id: 7, author: 'Milo', likeCount: 0, likedByViewer: false },
    })
  })

  it('returns an empty cursor-paginated feed', async () => {
    mockExecute.mockResolvedValue({ rows: [] })
    const response = await createCommunityRouter().request('/community/posts?limit=2')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ posts: [], nextCursor: null })
  })
})
