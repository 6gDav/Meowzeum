import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockExecute, mockSessionUser } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
  mockSessionUser: vi.fn(),
}))

vi.mock('../auth/helper/tursoClient.ts', () => ({
  turso: { execute: mockExecute },
}))

vi.mock('../auth/helper/getSession', () => ({
  getSessionUser: mockSessionUser,
}))

import { createCommunityRouter } from './community'

describe('community routes', () => {
  beforeEach(() => {
    mockExecute.mockReset()
    mockSessionUser.mockResolvedValue(42)
  })

  it('rejects non-HTTPS image URLs', async () => {
    mockExecute.mockImplementation(async ({ sql }: { sql: string }) => {
      if (sql.startsWith('SELECT id, firstName, lastName, picture FROM users')) {
        return { rows: [{ id: 42, firstName: 'Milo', lastName: 'Cat', picture: new Uint8Array([1, 2, 3]) }] }
      }
      return { rows: [], lastInsertRowid: 1n }
    })

    const response = await createCommunityRouter().request('/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author_id: 'Milo',
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
      if (sql.startsWith('SELECT id, firstName, lastName, picture FROM users')) {
        return { rows: [{ id: 42, firstName: 'Milo', lastName: 'Cat', picture: new Uint8Array([1, 2, 3]) }] }
      }
      if (sql.startsWith('INSERT INTO cat_posts')) return { rows: [], lastInsertRowid: 7n }
      return { rows: [] }
    })

    const response = await createCommunityRouter().request('/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: 'https://images.example.com/cat.jpg',
        caption: 'A cozy nap',
      }),
    })

    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({
      post: { id: 7, author: 'Milo Cat', avatar: 'AQID', likeCount: 0, likedByViewer: false },
    })
    expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({
      sql: expect.stringContaining('INSERT INTO cat_posts'),
      args: [42, 'https://images.example.com/cat.jpg', 'A cozy nap', expect.any(String)],
    }))
  })

  it('allows an anonymous viewer to load the feed', async () => {
    mockSessionUser.mockResolvedValue(null)
    mockExecute.mockResolvedValue({ rows: [] })

    const response = await createCommunityRouter().request('/community/posts?limit=2')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ posts: [], nextCursor: null })
  })

  it('returns post fields expected by the community page', async () => {
    mockExecute.mockResolvedValue({
      rows: [{
        id: 3,
        author_id: 42,
        firstName: 'Milo',
        lastName: 'Cat',
        avatar: new Uint8Array([1, 2, 3]),
        imageUrl: 'https://images.example.com/cat.jpg',
        caption: 'A cozy nap',
        createdAt: '2026-01-01T00:00:00.000Z',
        likeCount: 2,
        likedByViewer: 1,
      }],
    })

    const response = await createCommunityRouter().request('/community/posts')

    expect(await response.json()).toMatchObject({
      posts: [{
        id: 3,
        author: 'Milo Cat',
        avatar: 'AQID',
        likeCount: 2,
        likedByViewer: true,
      }],
    })
  })

  it('returns an empty cursor-paginated feed', async () => {
    mockExecute.mockResolvedValue({ rows: [] })
    const response = await createCommunityRouter().request('/community/posts?limit=2')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ posts: [], nextCursor: null })
  })
})
