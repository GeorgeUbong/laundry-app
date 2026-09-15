import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg p-4 text-app-text">
      <section className="w-full max-w-md rounded-xl border border-card-border bg-card-bg p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-brand-primary">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-grey-surface">
          The page you requested does not exist.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand-primary px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
