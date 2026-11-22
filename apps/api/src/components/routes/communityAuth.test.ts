import { describe, expect, it, vi } from 'vitest'

vi.mock('../db', () => ({
  db: { prepare: vi.fn() },
}))

import { db } from '../db'
import { createCommunityRouter } from './community'

describe('community write authentication', () => {
  it('rejects unauthenticated post requests before accessing the database', async () => {
    const response = await createCommunityRouter().request('/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: 'Milo',
        imageUrl: 'https://images.example.com/cat.jpg',
        caption: 'A cat',
      }),
    })

    expect(response.status).toBe(401)
    expect(db.prepare).not.toHaveBeenCalled()
  })

  it('rejects unauthenticated like requests even when a viewer id is supplied', async () => {
    const response = await createCommunityRouter().request('/community/posts/1/like', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewerId: 42, liked: true }),
    })

    expect(response.status).toBe(401)
    expect(db.prepare).not.toHaveBeenCalled()
  })

  it('rejects unauthenticated caption edit requests', async () => {
    const response = await createCommunityRouter().request('/community/posts/1/caption', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: 'A new caption' }),
    })

    expect(response.status).toBe(401)
    expect(db.prepare).not.toHaveBeenCalled()
  })
})
