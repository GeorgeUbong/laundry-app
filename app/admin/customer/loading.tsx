export default function LoadingC() {
  return (
    <div className="flex min-h-[220px] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-200" />
        Loading Customers...
      </div>
    </div>
  );
}
