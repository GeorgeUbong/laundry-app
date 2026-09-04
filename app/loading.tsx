export default function Loading() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-app-bg p-4 text-app-text">
			<div className="flex items-center gap-3 text-sm font-medium text-grey-surface">
				<span className="h-4 w-4 animate-spin rounded-full border-2 border-card-border border-t-brand-primary" />
				Loading...
			</div>
		</main>
	);
}