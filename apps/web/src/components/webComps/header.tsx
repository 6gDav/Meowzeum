import { Link } from '@tanstack/react-router'

export const Header = () => {
    return (
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
                <Link
                    to="/pages/community"
                    className="rounded-full px-2 py-2 text-xs font-semibold text-stone-600 transition hover:text-[#b45309] sm:px-3 sm:text-sm"
                >
                    <span className="sm:hidden">Feed</span>
                    <span className="hidden sm:inline">Community</span>
                </Link>
                <a
                    href="#collection"
                    className="hidden rounded-full px-3 py-2 text-sm font-semibold text-stone-600 transition hover:text-[#b45309] sm:inline-flex"
                >
                    Collection
                </a>
                <a
                    href="/pages/about"
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
    )
}