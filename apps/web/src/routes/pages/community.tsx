import { useEffect, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Header } from '#/components/webComps/header'
import {
  createCommunityPost,
  getCommunityPage,
  getCommunitySession,
  setCommunityPostLike,
  type CommunityPost,
} from '#/server/functions/community'

export const Route = createFileRoute('/pages/community')({
  component: Community,
})

const displayNameStorageKey = 'meowzeum-community-display-name'

function Community() {
  const queryClient = useQueryClient()
  const [displayName, setDisplayName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [formError, setFormError] = useState('')
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDisplayName(localStorage.getItem(displayNameStorageKey) ?? '')
  }, [])

  const sessionQuery = useQuery({
    queryKey: ['community-session'],
    queryFn: getCommunitySession,
  })

  const feedQuery = useInfiniteQuery({
    queryKey: ['community-posts'],
    queryFn: ({ pageParam }) => getCommunityPage({
      data: { cursor: pageParam },
    }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const postMutation = useMutation({
    mutationFn: createCommunityPost,
    onSuccess: async () => {
      setImageUrl('')
      setCaption('')
      setFormError('')
      await queryClient.invalidateQueries({ queryKey: ['community-posts'] })
    },
    onError: (error) => setFormError(error.message),
  })

  const likeMutation = useMutation({
    mutationFn: setCommunityPostLike,
    onSuccess: (result, variables) => {
      queryClient.setQueryData(
        ['community-posts'],
        (current: typeof feedQuery.data) => {
          if (!current) return current
          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) => post.id === variables.data.postId
                ? { ...post, likedByViewer: result.liked, likeCount: result.likeCount }
                : post),
            })),
          }
        },
      )
    },
  })

  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel || !feedQuery.hasNextPage) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !feedQuery.isFetchingNextPage) {
        void feedQuery.fetchNextPage()
      }
    }, { rootMargin: '400px' })

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [feedQuery.fetchNextPage, feedQuery.hasNextPage, feedQuery.isFetchingNextPage])

  const posts = feedQuery.data?.pages.flatMap((page) => page.posts) ?? []

  function submitPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    if (!sessionQuery.data?.user) {
      setFormError('Sign in before sharing a cat photo.')
      return
    }

    const author = displayName.trim()
    if (!author || author.length > 40) {
      setFormError('Choose a display name between 1 and 40 characters.')
      return
    }
    if (caption.trim().length > 500) {
      setFormError('Keep your caption to 500 characters or fewer.')
      return
    }

    try {
      const url = new URL(imageUrl)
      if (url.protocol !== 'https:') throw new Error('Photo URLs must use HTTPS.')
    } catch (error) {
      setFormError(error instanceof Error && error.message === 'Photo URLs must use HTTPS.'
        ? error.message
        : 'Enter a valid HTTPS photo URL.')
      return
    }

    localStorage.setItem(displayNameStorageKey, author)
    postMutation.mutate({
      data: { author, imageUrl: imageUrl.trim(), caption: caption.trim() },
    })
  }

  function toggleLike(post: CommunityPost) {
    if (likeMutation.isPending || !sessionQuery.data?.user) return
    likeMutation.mutate({
      data: { postId: post.id, liked: !post.likedByViewer },
    })
  }

  return (
    <div className="min-h-screen bg-[#fdf6e2] text-stone-800">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-8 sm:pt-12">
        <section className="mb-8 rounded-[2rem] bg-gradient-to-br from-[#fffaf0] via-[#fffaf0] to-[#f7e8c7] p-6 shadow-[0_20px_65px_-42px_rgba(120,53,15,0.5)] sm:p-10">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#b45309]">
            The cat community
          </p>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#713f12] sm:text-5xl">
            A daily dose of <span className="text-[#d97706]">meow.</span>
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-stone-600">
            Share a favorite, meet the cats everyone loves, and leave a little heart.
          </p>
        </section>

        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section aria-label="Cat photo feed" className="order-2 space-y-6 lg:order-1">
            {feedQuery.isPending && (
              <p className="rounded-3xl bg-white/80 p-8 text-center text-stone-500">Finding the latest cat photos…</p>
            )}
            {feedQuery.isError && (
              <div role="alert" className="rounded-3xl border border-red-200 bg-white p-6 text-red-800">
                <p className="font-bold">The feed could not be loaded.</p>
                <p className="mt-1 text-sm">{feedQuery.error.message}</p>
                <button
                  type="button"
                  onClick={() => void feedQuery.refetch()}
                  className="mt-4 rounded-full bg-[#b45309] px-4 py-2 text-sm font-bold text-white"
                >
                  Try again
                </button>
              </div>
            )}
            {likeMutation.isError && (
              <p role="alert" className="rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-800">
                Your like could not be saved: {likeMutation.error.message}
              </p>
            )}
            {sessionQuery.isError && (
              <p role="alert" className="rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-800">
                Sign-in status could not be checked: {sessionQuery.error.message}
              </p>
            )}

            {posts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-3xl border border-[#d97706]/15 bg-white shadow-sm shadow-[#713f12]/5">
                <div className="flex items-center gap-3 px-5 py-4">
                  <span className="grid size-10 place-items-center rounded-full bg-[#f7e8c7] text-lg" aria-hidden="true">🐾</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-[#713f12]">{post.author}</p>
                    <time className="text-xs text-stone-500" dateTime={post.createdAt}>
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                </div>
                <img
                  src={post.imageUrl}
                  alt={post.caption ? `Cat photo shared by ${post.author}: ${post.caption}` : `Cat photo shared by ${post.author}`}
                  loading="lazy"
                  className="max-h-[42rem] w-full bg-[#f7e8c7] object-cover"
                />
                <div className="p-5">
                  <button
                    type="button"
                    onClick={() => toggleLike(post)}
                    disabled={likeMutation.isPending || sessionQuery.isPending || !sessionQuery.data?.user}
                    aria-label={`${post.likedByViewer ? 'Unlike' : 'Like'} photo by ${post.author}`}
                    aria-pressed={post.likedByViewer}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b45309] disabled:opacity-60 ${post.likedByViewer ? 'bg-rose-50 text-rose-600' : 'bg-[#fdf6e2] text-[#9a4f0a] hover:bg-[#f7e8c7]'}`}
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill={post.likedByViewer ? 'currentColor' : 'none'} className="size-5">
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
                  </button>
                  {!sessionQuery.isPending && !sessionQuery.isError && !sessionQuery.data?.user && (
                    <p className="mt-2 text-sm text-stone-500">
                      <Link to="/pages/auth" className="font-bold text-[#b45309] underline">Sign in</Link>
                      {' '}to like this photo.
                    </p>
                  )}
                  {post.caption && (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                      <span className="mr-2 font-extrabold text-[#713f12]">{post.author}</span>
                      {post.caption}
                    </p>
                  )}
                </div>
              </article>
            ))}

            {!feedQuery.isPending && !feedQuery.isError && posts.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#d97706]/35 bg-white/65 px-6 py-12 text-center">
                <span className="text-4xl" aria-hidden="true">😺</span>
                <h2 className="mt-4 font-serif text-2xl font-bold text-[#713f12]">You found the first pawprint.</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">Share a cat photo and start the feed.</p>
              </div>
            )}

            {feedQuery.isFetchingNextPage && (
              <p className="py-4 text-center text-sm text-stone-500">More whiskers incoming…</p>
            )}
            {feedQuery.hasNextPage && <div ref={loadMoreRef} aria-hidden="true" className="h-2" />}
          </section>

          <aside className="order-1 h-fit rounded-3xl border border-[#d97706]/15 bg-white p-5 shadow-sm shadow-[#713f12]/5 lg:sticky lg:top-6 lg:order-2">
            <h2 className="font-serif text-xl font-bold text-[#713f12]">Share a cat photo</h2>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              Add a photo link and a little story for the community.
            </p>
            {!sessionQuery.isPending && !sessionQuery.isError && !sessionQuery.data?.user ? (
              <p className="mt-4 text-sm leading-6 text-stone-600">
                <Link to="/pages/auth" className="font-bold text-[#b45309] underline">Sign in</Link>
                {' '}to share a cat photo with the community.
              </p>
            ) : (
            <form onSubmit={submitPost} className="mt-5 space-y-4">
              <label className="block text-sm font-bold text-stone-700">
                Your display name
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={40}
                  required
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#fffdf8] px-3 py-2.5 font-normal outline-none transition focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/15"
                  placeholder="Cat person"
                />
              </label>
              <label className="block text-sm font-bold text-stone-700">
                Photo URL
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  required
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#fffdf8] px-3 py-2.5 font-normal outline-none transition focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/15"
                  placeholder="https://…"
                />
              </label>
              <label className="block text-sm font-bold text-stone-700">
                Caption <span className="font-normal text-stone-400">(optional)</span>
                <textarea
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  maxLength={500}
                  rows={3}
                  className="mt-1.5 w-full resize-y rounded-xl border border-stone-200 bg-[#fffdf8] px-3 py-2.5 font-normal outline-none transition focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/15"
                  placeholder="What makes this cat special?"
                />
              </label>
              {formError && <p role="alert" className="text-sm font-semibold text-red-700">{formError}</p>}
              <button
                type="submit"
                disabled={postMutation.isPending || sessionQuery.isPending || !sessionQuery.data?.user}
                className="w-full rounded-full bg-[#b45309] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#92400e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b45309] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {postMutation.isPending ? 'Sharing…' : 'Share with the community'}
              </button>
            </form>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
