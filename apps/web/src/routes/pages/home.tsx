import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pages/home')({
  component: Home,
})

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

          <div
            role="img"
            aria-label="Placeholder for a featured cat image"
            className="relative mt-10 flex aspect-[4/3] w-full max-w-3xl items-center justify-center overflow-hidden rounded-[2rem] border border-[#d97706]/25 bg-[#f7e8c7] p-5 shadow-[0_24px_70px_-35px_rgba(120,53,15,0.4)] sm:mt-14 sm:aspect-[16/8]"
          >
            <div className="absolute inset-3 rounded-[1.5rem] border border-dashed border-[#b45309]/30 sm:inset-5" />
            <div className="relative flex max-w-xs flex-col items-center">
              <span className="mb-5 grid size-20 place-items-center rounded-full bg-[#fffaf0] text-[#b45309] shadow-sm">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 48 48"
                  fill="none"
                  className="size-10"
                >
                  <rect x="5" y="8" width="38" height="32" rx="6" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="17" cy="19" r="3.5" fill="currentColor" />
                  <path d="m9 35 10-10 7 7 5-5 8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#9a4f0a]">
                Your featured cat goes here
              </span>
              <span className="mt-2 text-sm text-stone-600">
                A lovely photo will make this space its home.
              </span>
            </div>
            <span className="absolute left-7 top-7 rounded-full bg-[#fffaf0]/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#9a4f0a] sm:left-10 sm:top-10">
              Featured
            </span>
            <span className="absolute bottom-7 right-7 text-xs font-bold tracking-widest text-[#9a4f0a]/70 sm:bottom-10 sm:right-10">
              01 / 12
            </span>
          </div>

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
