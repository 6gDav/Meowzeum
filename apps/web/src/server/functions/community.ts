import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'

export type CommunityPost = {
  id: number
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
}

type CreatePostRequest = {
  author: string
  imageUrl: string
  caption: string
}

type LikeRequest = {
  postId: number
  liked: boolean
}

type ApiError = {
  error?: string
}

type CommunityUser = {
  id: number
  firstName: string
  lastName: string
}

const apiBaseUrl = (process.env.MEOWZEUM_API_URL ?? 'http://127.0.0.1:3001').replace(/\/+$/, '')

async function requestApi<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers)
    const cookie = getRequestHeader('cookie')
    if (cookie) headers.set('Cookie', cookie)

    const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers })
    const result = await response.json() as T & ApiError

    if (!response.ok) {
        throw new Error(result.error ?? `The community API returned ${response.status}.`)
    }

    return result
}

const getCommunitySession = createServerFn({ method: 'GET' }).handler(async () => {
    const result = await requestApi<{ user: CommunityUser | null }>('/auth/session')
    return result
})

const getCommunityPage = createServerFn({ method: 'GET' }).validator((data: FeedRequest) => data).handler(async ({ data }) => {
    const query = new URLSearchParams({ limit: '8' })
    if (data.cursor) query.set('cursor', data.cursor)

    return requestApi<CommunityPage>(`/community/posts?${query}`)
})

const createCommunityPost = createServerFn({ method: 'POST' }).validator((data: CreatePostRequest) => data).handler(async ({ data }) => {
    return requestApi<{ post: CommunityPost }>('/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
})

const setCommunityPostLike = createServerFn({ method: 'POST' }).validator((data: LikeRequest) => data).handler(async ({ data }) => {
    return requestApi<{ liked: boolean; likeCount: number }>(`/community/posts/${encodeURIComponent(data.postId)}/like`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: data.liked }),
    })
})

export { createCommunityPost, getCommunityPage, getCommunitySession, setCommunityPostLike }
