export default function Footer() {
    const linkClass =
        "text-[#e5a965] hover:text-[#fdf6e2] hover:underline transition-colors";
    const titleClass =
        "text-[#fdf6e2] font-bold uppercase text-sm tracking-wider mb-1";

    return (
        <footer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-[#b45309] text-[#fdf6e2] border-t-2 border-[#d97706] p-10 w-full">
            <aside className="flex flex-col items-start gap-3">
                <img
                    // src={catImage}
                    alt="cat-image"
                    className="w-[120px] h-[120px] object-contain rounded-xl border-2 border-transparent hover:border-[#d97706] hover:-translate-y-[3px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
                <a
                    className={`${linkClass} font-medium`}
                    href="https://github.com/6gDav"
                    target="_blank"
                    rel="noreferrer"
                >
                    6gDav
                </a>
            </aside>

            <nav className="flex flex-col items-start gap-2">
                <h6 className={titleClass}>Services</h6>
                <a className={linkClass} href="https://github.com/6gDav/GetACat_Frontend" target="_blank" rel="noreferrer">Frontend Code</a>
                <a className={linkClass} href="https://github.com/6gDav/GetACat_Backend" target="_blank" rel="noreferrer">Backend Code</a>
                <a className={linkClass} href="#apidescription" title="A bit above">Read Documentation Here</a>
            </nav>

            <nav className="flex flex-col items-start gap-2">
                <h6 className={titleClass}>Programming Tools</h6>
                <a className={linkClass} href="https://tailwindcss.com/" target="_blank" rel="noreferrer">Design (Tailwind CSS)</a>
                <a className={linkClass} href="https://developer.mozilla.org/en-US/docs/Web/CSS" target="_blank" rel="noreferrer">Design (CSS)</a>
                <a className={linkClass} href="https://react.dev/" target="_blank" rel="noreferrer">Framework (React)</a>
            </nav>

            <nav className="flex flex-col items-start gap-2">
                <h6 className={titleClass}>Licence</h6>
                <a className={linkClass} href="https://opensource.org/license/mit" target="_blank" rel="noreferrer">MIT (Licence)</a>
            </nav>
        </footer>
    );
}