"use client"
export default function Loading() {
  return (
    <div className="flex min-h-[220px] w-full items-center justify-center rounded-xl border border-card-border bg-grey-light/60 dark:border-grey-dark dark:bg-grey-dark/30">
      <div className="flex items-center gap-3 text-sm font-medium text-grey-surface">
        <span className="loader" aria-label="Loading customers" />
        Loading Customers...
      </div>
    </div>
  );
}
