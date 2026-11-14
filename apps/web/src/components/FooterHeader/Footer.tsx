
// Footer.jsx
// Palette:
//   #b45309 – footer background (dark amber)
//   #d97706 – accent / hover / divider
//   #fdf6e2 – main text (cream)
//   #e5a965 – secondary text & links (sand)

const columns = [
    {
        title: "Product",
        links: [
            { label: "Features", href: "/features" },
            { label: "Pricing", href: "/pricing" },
            { label: "Changelog", href: "/changelog" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About", href: "/about" },
            { label: "Blog", href: "/blog" },
            { label: "Careers", href: "/careers" },
        ],
    },
    {
        title: "Support",
        links: [
            { label: "Help center", href: "/help" },
            { label: "Contact", href: "/contact" },
            { label: "Privacy policy", href: "/privacy" },
        ],
    },
];

function Footer() {
    return (
        <footer className="bg-[#b45309] text-[#fdf6e2]">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
                {/* Brand */}
                <div>
                    <a href="/" className="text-2xl font-bold tracking-tight">
                        Brand<span className="text-[#e5a965]">Name</span>
                    </a>
                    <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#e5a965]">
                        Short description of what you build and who it is for.
                    </p>
                </div>

                {/* Link columns */}
                {columns.map((col) => (
                    <nav key={col.title} aria-label={col.title}>
                        <h3 className="text-sm font-semibold text-[#fdf6e2]">{col.title}</h3>
                        <ul className="mt-4 space-y-3">
                            {col.links.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-[#e5a965] transition-colors hover:text-[#fdf6e2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fdf6e2]"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                ))}
            </div>

            {/* Bottom bar */}
            <div className="border-t border-[#d97706]">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 text-sm text-[#e5a965] sm:flex-row">
                    <p>&copy; {new Date().getFullYear()} BrandName. All rights reserved.</p>
                    <div className="flex gap-5">
                        <a href="/terms" className="transition-colors hover:text-[#fdf6e2]">
                            Terms
                        </a>
                        <a href="/privacy" className="transition-colors hover:text-[#fdf6e2]">
                            Privacy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;