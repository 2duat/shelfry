export default function SiteLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-5 pt-12 md:px-8">
      <div className="h-9 w-64 rounded-lg bg-surface-soft" />
      <div className="mt-3 h-4 w-96 max-w-full rounded bg-surface-soft" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-40 rounded-[18px] border border-line bg-surface" />
        ))}
      </div>
    </div>
  )
}
