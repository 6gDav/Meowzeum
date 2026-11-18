import { Link, createFileRoute } from '@tanstack/react-router'
import { Header } from '#/components/webComps/header'

export const Route = createFileRoute('/pages/about')({
  component: About,
})

function About() {
  return (
    <div className="min-h-screen bg-[#fdf6e2] text-stone-800">
      <Header />
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.85fr] lg:py-24">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-[#d97706]/20 bg-white/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#b45309]">
              About the Meowzeum
            </p>
            <h1 className="max-w-2xl font-serif text-5xl font-bold leading-[1.05] tracking-tight text-[#713f12] sm:text-7xl">
              Every cat deserves
              <span className="text-[#d97706]"> a place in the gallery.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-stone-600">
              Meowzeum is a cozy digital collection where curious cat people can meet
              remarkable felines, enjoy their quirks, and build a personal collection
              of favorites.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/pages/home"
                className="rounded-full bg-[#d97706] px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-[#b45309]/15 transition hover:-translate-y-0.5 hover:bg-[#b45309]"
              >
                Explore the collection
              </Link>
              <Link
                to="/pages/auth"
                className="rounded-full border border-[#d97706]/30 bg-[#fffaf0] px-6 py-3 text-sm font-extrabold text-[#9a4f0a] transition hover:border-[#d97706]/60"
              >
                Join the Meowzeum
              </Link>
            </div>
          </div>

          <div
            role="img"
            aria-label="Illustration of a cat in a museum gallery"
            className="relative mx-auto aspect-[5/4] w-full max-w-xl overflow-hidden rounded-[2.25rem] border border-[#d97706]/20 bg-[#f4ddb2] shadow-[0_30px_80px_-38px_rgba(120,53,15,0.55)]"
          >
            <div className="absolute left-[8%] top-[8%] h-[70%] w-[84%] rounded-t-[2rem] border-x border-t border-white/50 bg-[#fffaf0]/55" />
            <div className="absolute bottom-[11%] left-[7%] h-[7%] w-[86%] rounded-full bg-[#d7ad73]/25" />
            <div className="absolute left-[13%] top-[17%] h-[43%] w-[30%] rounded-xl border-4 border-[#fffaf0] bg-[#d97706]/15 p-3 shadow-sm">
              <div className="h-full rounded-lg border border-[#b45309]/15 bg-[#fdf6e2]">
                <span className="mx-auto mt-[38%] block h-2 w-12 rounded-full bg-[#d97706]/30" />
              </div>
            </div>
            <div className="absolute right-[12%] top-[17%] h-[43%] w-[30%] rounded-xl border-4 border-[#fffaf0] bg-[#d97706]/15 p-3 shadow-sm">
              <div className="h-full rounded-lg border border-[#b45309]/15 bg-[#fdf6e2]">
                <span className="mx-auto mt-[38%] block h-2 w-12 rounded-full bg-[#d97706]/30" />
              </div>
            </div>

            <div className="absolute bottom-[14%] left-1/2 size-32 -translate-x-1/2 sm:size-36">
              <div className="absolute bottom-0 left-1/2 h-[72%] w-[70%] -translate-x-1/2 rounded-[48%_48%_35%_35%] bg-[#9a5a35]" />
              <div className="absolute left-[13%] top-[8%] size-[74%] rounded-full bg-[#b66d43]" />
              <div className="absolute left-[15%] top-[2%] h-[28%] w-[28%] -rotate-[18deg] rounded-tl-[100%] rounded-tr-[20%] bg-[#b66d43]" />
              <div className="absolute right-[15%] top-[2%] h-[28%] w-[28%] rotate-[18deg] rounded-tr-[100%] rounded-tl-[20%] bg-[#b66d43]" />
              <div className="absolute left-[31%] top-[39%] size-2 rounded-full bg-[#713f12]" />
              <div className="absolute right-[31%] top-[39%] size-2 rounded-full bg-[#713f12]" />
              <div className="absolute left-1/2 top-[52%] h-2 w-3 -translate-x-1/2 rounded-[50%] bg-[#713f12]" />
              <div className="absolute left-1/2 top-[58%] h-5 w-px -translate-x-1/2 bg-[#713f12]/50" />
              <div className="absolute bottom-[8%] left-1/2 h-4 w-20 -translate-x-1/2 rounded-full bg-[#713f12]/10" />
            </div>
          </div>
        </section>

        <section className="border-y border-[#d97706]/15 bg-[#fffaf0]/65">
          <div className="mx-auto grid max-w-7xl gap-px px-5 sm:grid-cols-3 sm:px-8">
            {[
              ['01', 'Browse', 'Discover a thoughtfully gathered collection of feline personalities.'],
              ['02', 'Remember', 'Save the cats that catch your eye and make their place feel familiar.'],
              ['03', 'Celebrate', 'Share a little joy with a community that speaks fluent meow.'],
            ].map(([number, title, copy]) => (
              <article
                key={number}
                className="border-b border-[#d97706]/15 py-9 sm:border-b-0 sm:border-r sm:px-8 sm:py-12 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0"
              >
                <p className="text-xs font-extrabold tracking-[0.2em] text-[#d97706]">{number}</p>
                <h2 className="mt-3 font-serif text-2xl font-bold text-[#713f12]">{title}</h2>
                <p className="mt-3 max-w-sm leading-7 text-stone-600">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#b45309]">Our idea</p>
              <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-[#713f12]">
                A slower, sweeter corner of the internet.
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <article className="rounded-3xl border border-[#d97706]/15 bg-white/60 p-6">
                <h3 className="font-bold text-[#713f12]">For everyday delight</h3>
                <p className="mt-3 leading-7 text-stone-600">
                  Meowzeum is meant to be a pause from the noise: simple, welcoming,
                  and full of small reasons to smile.
                </p>
              </article>
              <article className="rounded-3xl border border-[#d97706]/15 bg-white/60 p-6">
                <h3 className="font-bold text-[#713f12]">Made for cat people</h3>
                <p className="mt-3 leading-7 text-stone-600">
                  Whether you live with a cat or simply admire them from afar, this
                  is a place to find and celebrate the ones you love.
                </p>
              </article>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-[#713f12] px-7 py-8 text-[#fffaf0] sm:flex-row sm:items-center sm:px-10">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#eabf82]">Visit the gallery</p>
              <h2 className="mt-2 font-serif text-3xl font-bold">Ready to meet your new favorite?</h2>
            </div>
            <Link
              to="/pages/home"
              className="shrink-0 rounded-full bg-[#fffaf0] px-6 py-3 text-sm font-extrabold text-[#713f12] transition hover:bg-[#f7e8c7]"
            >
              Browse cats
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
