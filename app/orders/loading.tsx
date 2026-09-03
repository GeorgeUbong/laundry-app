export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">

        <div>
          <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-200" />
        </div>

      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />

            <div className="mt-3 h-9 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        ))}

      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Table header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-5">

          <div>
            <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />

            <div className="mt-2 h-3 w-40 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="flex gap-2">

            <div className="h-9 w-16 animate-pulse rounded-lg bg-gray-200" />

            <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-200" />

            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200" />

          </div>

        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">

          {[1, 2, 3, 4, 5].map((row) => (

            <div
              key={row}
              className="flex items-center gap-6 px-6 py-6"
            >

              <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />

              <div className="flex-1">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />

                <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-200" />
              </div>

              <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />

              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />

              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />

              <div className="h-8 w-28 animate-pulse rounded bg-gray-200" />

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}