export default function Loading() {
  return (
    <div className="flex min-h-[200px] items-center justify-center gap-3 text-sm text-grey-surface">
      <span className="loader" aria-label="Loading orders" />
      Loading Orders...
    </div>
  );
}
