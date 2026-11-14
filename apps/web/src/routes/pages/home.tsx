import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/pages/home')({
  component: Home,
})

function GetFeaturedCat() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadCatImage() {
      try {
        const response = await fetch('http://localhost:3001/get-a-cat-image', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`The cat image API returned ${response.status}.`)
        }

        const result: unknown = await response.json()
        const imageUrls = Array.isArray(result)
          ? result.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
          : []

        if (imageUrls.length === 0) {
          throw new Error('The cat image API did not return any images.')
        }

        setImageUrl(imageUrls[Math.floor(Math.random() * imageUrls.length)])
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Unable to load a cat image.')
        }
      }
    }

    void loadCatImage()
    return () => controller.abort()
  }, [])

  return (
    <div
      aria-busy={!imageUrl && !error}
      className="relative mt-10 flex aspect-[4/3] w-full max-w-3xl items-center justify-center overflow-hidden rounded-[2rem] border border-[#d97706]/25 bg-[#f7e8c7] p-5 shadow-[0_24px_70px_-35px_rgba(120,53,15,0.4)] sm:mt-14 sm:aspect-[16/8]"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Featured cat"
          className="absolute inset-0 size-full object-cover"
          onError={() => {
            setImageUrl(null)
            setError('The selected cat image could not be displayed.')
          }}
        />
      ) : (
        <p aria-live="polite" className="max-w-sm text-sm font-semibold text-[#9a4f0a]">
          {error ?? 'Finding a lovely cat for you...'}
        </p>
      )}
      <span className="absolute left-7 top-7 rounded-full bg-[#fffaf0]/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#9a4f0a] sm:left-10 sm:top-10">
        Featured
      </span>
    </div>
  )
}

function Home() {
  return (
    <div className="min-h-screen bg-[#fdf6e2] text-stone-800">
      <header className="border-b border-[#d97706]/15 bg-[#fffaf0]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8">
          <Link
            to="/pages/home"
            className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-[#9a4f0a]"
            aria-label="Meowzeum home"
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-[#d97706] text-lg text-white shadow-sm shadow-[#b45309]/20">
              m
            </span>
            Meowzeum
          </Link>

          <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-6">
            <Link
              to="/pages/home"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-[#9a4f0a] sm:inline-flex"
            >
              Home
            </Link>
            <a
              href="#collection"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-stone-600 transition hover:text-[#b45309] sm:inline-flex"
            >
              Collection
            </a>
            <a
              href="#about"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-stone-600 transition hover:text-[#b45309] sm:inline-flex"
            >
              About
            </a>
            <Link
              to="/pages/auth"
              className="rounded-full bg-[#b45309] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#92400e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b45309]"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section
          id="collection"
          className="mx-auto flex max-w-7xl flex-col items-center px-5 pb-20 pt-14 text-center sm:px-8 sm:pt-20"
        >
          <p className="mb-4 rounded-full border border-[#d97706]/20 bg-white/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#b45309]">
            A little corner of the internet for cats
          </p>
          <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight text-[#713f12] sm:text-6xl">
            Welcome to the
            <span className="text-[#d97706]"> Meowzeum</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
            Take a moment, meet a few lovely cats, and find your new favorite.
          </p>

          <GetFeaturedCat />

          <div id="about" className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              to="/pages/auth"
              className="rounded-full bg-[#d97706] px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-[#b45309]/15 transition hover:-translate-y-0.5 hover:bg-[#b45309] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b45309]"
            >
              Join the Meowzeum
            </Link>
            <p className="text-sm text-stone-500">A cozy collection, made for cat people.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
