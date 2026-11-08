import { Link } from "@tanstack/react-router";

export default function NotFoundPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
            <p className="mt-2 text-gray-500">
                The route doesn't exist.
            </p>
            <Link to="/" className="mt-6 rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700"
            >
                Back to the main page.
            </Link>
        </div>
    )
}