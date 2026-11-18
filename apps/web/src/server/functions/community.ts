import { createServerFn } from '@tanstack/react-start'

export type CommunityPost = {
  id: string
  author: string
  imageUrl: string
  caption: string
  createdAt: string
  likeCount: number
  likedByViewer: boolean
}

export type CommunityPage = {
  posts: CommunityPost[]
  nextCursor: string | null
}

type FeedRequest = {
  cursor: string | null
  viewerId: string
}

type CreatePostRequest = {
  author: string
  imageUrl: string
  caption: string
}

type LikeRequest = {
  postId: string
  viewerId: string
  liked: boolean
}

type ApiError = {
  error?: string
}

const apiBaseUrl = (process.env.MEOWZEUM_API_URL ?? 'http://127.0.0.1:3001')
  .replace(/\/+$/, '')

async function requestApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, init)
  const result = await response.json() as T & ApiError

  if (!response.ok) {
    throw new Error(result.error ?? `The community API returned ${response.status}.`)
  }

  return result
}

const getCommunityPage = createServerFn({ method: 'GET' })
  .validator((data: FeedRequest) => data)
  .handler(async ({ data }) => {
    const query = new URLSearchParams({ viewerId: data.viewerId, limit: '8' })
    if (data.cursor) query.set('cursor', data.cursor)

    return requestApi<CommunityPage>(`/community/posts?${query}`)
  })

const createCommunityPost = createServerFn({ method: 'POST' })
  .validator((data: CreatePostRequest) => data)
  .handler(async ({ data }) => {
    return requestApi<{ post: CommunityPost }>('/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  })

const setCommunityPostLike = createServerFn({ method: 'POST' })
  .validator((data: LikeRequest) => data)
  .handler(async ({ data }) => {
    return requestApi<{ liked: boolean; likeCount: number }>(
      `/community/posts/${encodeURIComponent(data.postId)}/like`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewerId: data.viewerId, liked: data.liked }),
      },
    )
  })

export { createCommunityPost, getCommunityPage, setCommunityPostLike }
