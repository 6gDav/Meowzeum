import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'

export type CommunityPost = {
  id: number
  author: string
  avatar: string | null
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
  imageUrl: string
  caption: string
}

type LikeRequest = {
  postId: number
  liked: boolean
}

type EditCaptionRequest = {
  postId: number
  caption: string
}

type ApiError = {
  error?: string
}

type CommunityUser = {
  firstName: string
  lastName: string
}

type ApiCommunityPost = Pick<CommunityPost, 'id' | 'imageUrl' | 'caption' | 'createdAt'> & {
  author?: string
  avatar?: string | null
  author_id?: string | number
  likeCount?: number
  likedByViewer?: boolean
}

type ApiCommunityPage = {
  posts: ApiCommunityPost[]
  nextCursor: string | number | null
}

const apiBaseUrl = (
  process.env.API_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'https://meowzeum-api.onrender.com'
    : process.env.MEOWZEUM_API_URL ?? 'http://localhost:3001')
).replace(/\/+$/, '')

async function requestApi<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  const cookie = getRequestHeader('cookie')
  if (cookie) headers.set('Cookie', cookie)

  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers })
  const result = await response.json() as T & ApiError

  if (!response.ok) {
    if (response.status === 401) throw new CommunityUnauthenticatedError()
    throw new Error(result.error ?? `The community API returned ${response.status}.`)
  }

  return result
}

class CommunityUnauthenticatedError extends Error {}

const getCommunitySession = createServerFn({ method: 'GET' }).handler(async () => {
  if (!getRequestHeader('cookie')) return { user: null }

  try {
    const result = await requestApi<{
      success: boolean
      data?: CommunityUser
    }>('/me')
    return { user: result.success ? result.data ?? null : null }
  } catch (error) {
    if (error instanceof CommunityUnauthenticatedError) return { user: null }
    throw error
  }
})

const getCommunityPage = createServerFn({ method: 'GET' }).validator((data: FeedRequest) => data).handler(async ({ data }) => {
  const query = new URLSearchParams({ limit: '8' })
  if (data.cursor) query.set('cursor', data.cursor)

  const result = await requestApi<ApiCommunityPage>(`/community/posts?${query}`)
  return {
    posts: result.posts.map((post) => ({
      id: post.id,
      author: post.author ?? String(post.author_id ?? ''),
      avatar: post.avatar ?? null,
      imageUrl: post.imageUrl,
      caption: post.caption,
      createdAt: post.createdAt,
      likeCount: Number(post.likeCount ?? 0),
      likedByViewer: Boolean(post.likedByViewer),
    })),
    nextCursor: result.nextCursor === null ? null : String(result.nextCursor),
  } satisfies CommunityPage
})

const createCommunityPost = createServerFn({ method: 'POST' }).validator((data: CreatePostRequest) => data).handler(async ({ data }) => {
  const result = await requestApi<{ post: ApiCommunityPost }>('/community/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl: data.imageUrl,
      caption: data.caption,
    }),
  })
  return {
    post: {
      id: result.post.id,
      author: result.post.author ?? '',
      avatar: result.post.avatar ?? null,
      imageUrl: result.post.imageUrl,
      caption: result.post.caption,
      createdAt: result.post.createdAt,
      likeCount: Number(result.post.likeCount ?? 0),
      likedByViewer: Boolean(result.post.likedByViewer),
    },
  }
})

// idk mér post
const setCommunityPostLike = createServerFn({ method: 'POST' }).validator((data: LikeRequest) => data).handler(async ({ data }) => {
  return requestApi<{ liked: boolean; likeCount: number }>(`/community/posts/${encodeURIComponent(data.postId)}/like`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ liked: data.liked }),
  })
})

// ez is
const deleteCommunityPost = createServerFn({ method: 'POST' }).validator((data: LikeRequest) => data).handler(async ({ data }) => {
    return requestApi<{ liked: boolean; likeCount: number }>(`/community/posts/${encodeURIComponent(data.postId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })
})

// ez is
const editCommunityPostCaption = createServerFn({ method: 'POST' }).validator((data: EditCaptionRequest) => data).handler(async ({ data }) => {
    return requestApi<{ message: string; caption: string; post: { id: number; caption: string } }>(
        `/community/posts/${encodeURIComponent(data.postId)}/caption`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caption: data.caption }),
        },
    )
})

export { createCommunityPost, editCommunityPostCaption, getCommunityPage, getCommunitySession, setCommunityPostLike, deleteCommunityPost }
