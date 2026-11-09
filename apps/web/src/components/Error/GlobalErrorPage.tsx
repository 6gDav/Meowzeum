import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router"

export default function GlobalErrorPage({ error, reset }: ErrorComponentProps) {
    const router = useRouter()

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h1 className="text-3xl font-bold text-red-600">Ops... Error occured</h1>
            <p className="mt-2 text-gray-600">
                {error instanceof Error ? error.message : 'Ismeretlen hiba lépett fel.'}
            </p>
            <div className="mt-6 flex gap-4">
                <button onClick={() => { reset(); router.invalidate() }}
                    className="rounded bg-gray-800 px-py-2 text-white hover:bg-gray-900">
                    Retry
                </button>
                <Link to="/" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">
                    Back to the main page.
                </Link>
            </div>
        </div>
    )
}