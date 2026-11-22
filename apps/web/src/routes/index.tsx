import { Link, createFileRoute, redirect } from "@tanstack/react-router"
import CursorWatchingCat from "#/components/catEye/catEye"

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-[#fdf6e2] text-stone-800">
      <main className="mx-auto flex max-w-5xl flex-col items-center px-5 pb-20 pt-14 text-center sm:px-8 sm:pt-20">
        <CursorWatchingCat className="mb-6 h-32 w-32 sm:h-40 sm:w-40" />

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

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            to="/pages/gallery"
            className="rounded-full bg-[#d97706] px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-[#b45309]/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#92400e] hover:shadow-lg hover:shadow-[#b45309]/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b45309]"
          >
            Visit the Gallery
          </Link>
          <Link
            to="/pages/auth"
            className="rounded-full border border-[#d97706]/40 bg-white/70 px-6 py-3 text-sm font-extrabold text-[#b45309] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b45309]"
          >
            Join the Meowzeum
          </Link>
        </div>

        <section className="mx-auto mt-16 grid w-full max-w-2xl gap-4 sm:mt-24 sm:grid-cols-2">
          <Link
            to="/pages/gallery"
            className="flex flex-col items-center rounded-3xl border border-[#d97706]/20 bg-white/70 p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
          >
            <span className="mb-3 grid size-12 place-items-center rounded-full bg-[#fffaf0] text-2xl">
              🖼️
            </span>
            <h2 className="font-serif text-lg font-bold text-[#713f12]">
              Browse the gallery
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              A growing collection of cats, one lovely photo at a time.
            </p>
          </Link>

          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center rounded-3xl border border-[#d97706]/20 bg-white/70 p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
          >
            <span className="mb-3 grid size-12 place-items-center rounded-full bg-[#fffaf0] text-2xl">
              ⚙️
            </span>
            <h2 className="font-serif text-lg font-bold text-[#713f12]">
              Use the API
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Fetch Meowzeum cats in your own projects.
            </p>
          </a>
        </section>
      </main>
    </div>
  )
}
  beforeLoad: () => {
    throw redirect({ to: '/pages/auth' })
  }
})
