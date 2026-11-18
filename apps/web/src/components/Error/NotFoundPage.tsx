import { Link } from "@tanstack/react-router";

export default function NotFoundPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h1 className="text-4xl font-bold text-[#d97706]">404 - Page Not Found</h1>
            <p className="mt-2 text-gray-600">
                The route doesn't exist.
            </p>
            <Link
                to="/"
                className="mt-6 rounded bg-[#d97706] px-4 py-2 text-white transition-colors hover:bg-[#b45309]"
            >
                Back to the main page.
            </Link>
        </div>
    )
}