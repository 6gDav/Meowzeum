import { Link, createFileRoute } from "@tanstack/react-router"
import WelcomeCat from "#/assets/welcomecat.jpeg"

export const Route = createFileRoute('/pages/welcomePage')({
    component: Welcome,
})

function Welcome() {
    // Replace with your actual auth state / user hook
    const user = {
        name: "Cat Lover",
        isNewUser: true,
    }

    return (
        <div className="min-h-screen bg-[#fdf6e2] text-stone-800">
            <main className="mx-auto flex max-w-5xl flex-col items-center px-5 pb-20 pt-8 text-center sm:px-8 sm:pt-10">

                <p className="mb-4 rounded-full border border-[#d97706]/20 bg-white/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#b45309]">
                    {user.isNewUser ? "Membership confirmed 🐾" : "Welcome back 🐾"}
                </p>

                <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight text-[#713f12] sm:text-6xl">
                    {user.isNewUser ? "Glad you're here," : "Good to see you,"}
                    <span className="text-[#d97706]"> {user.name}</span>
                </h1>

                {/* Image here */}
                <div className="mt-8 w-full max-w-md sm:mt-10">
                    <img
                        src={WelcomeCat}
                        alt="Welcome cat"
                        className="h-64 w-full rounded-3xl border-2 border-[#d97706] object-cover shadow-md shadow-[#b45309]/15 sm:h-72"
                    />
                </div>

                {/* Primary action */}
                <div className="mt-10 flex w-full justify-center">
                    <Link
                        to="/"
                        className="rounded-full bg-[#d97706] px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-[#b45309]/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#92400e] hover:shadow-lg hover:shadow-[#b45309]/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b45309]"
                    >
                        Take me home.
                    </Link>
                </div>

                {/* Feature navigation */}
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