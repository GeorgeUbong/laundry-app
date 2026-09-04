"use client";

export default function Error({
	error,
	retry,
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	return (
		<main className="flex min-h-screen items-center justify-center bg-app-bg p-4 text-app-text">
			<section className="w-full max-w-md rounded-xl border border-card-border bg-card-bg p-6 text-center shadow-sm">
				<h1 className="text-xl font-semibold">Something went wrong</h1>
				<p className="mt-2 text-sm text-grey-surface">
					We could not load this page. Please try again.
				</p>
				<button
					type="button"
					  onClick={() => retry()}
					className="mt-6 h-10 rounded-lg bg-brand-primary px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
				>
					Try again
				</button>
			</section>
		</main>
	);
}