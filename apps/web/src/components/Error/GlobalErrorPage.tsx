import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router"

export default function GlobalErrorPage({ error, reset }: ErrorComponentProps) {
    const router = useRouter()

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h1 className="text-3xl font-bold text-[#d97706]">Ops... Error occured</h1>
            <p className="mt-2 text-gray-600">
                {error instanceof Error ? error.message : 'An unknown error occurred.'}
            </p>
            <div className="mt-6 flex gap-4">
                <button
                    onClick={() => { reset(); router.invalidate() }}
                    className="rounded bg-[#d97706] px-4 py-2 text-white transition-colors hover:bg-[#b45309]"
                >
                    Retry
                </button>
                <Link
                    to="/"
                    className="rounded border border-[#d97706] px-4 py-2 text-[#b45309] transition-colors hover:bg-[#d97706]/10"
                >
                    Back to the main page.
                </Link>
            </div>
        </div>
    )
}