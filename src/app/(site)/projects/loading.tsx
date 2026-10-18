export default function ProjectsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-5 pb-6 pt-12 md:px-8">
      <div className="h-10 w-48 rounded-lg bg-surface-soft" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-surface-soft" />
      <div className="mt-3 h-3 w-24 rounded bg-surface-soft" />

      <div className="mt-5 h-11 rounded-[14px] border border-line bg-surface" />
      <div className="mt-5 h-[132px] rounded-[16px] border border-line bg-surface" />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-[164px] rounded-[18px] border border-line bg-surface" />
        ))}
      </div>
    </div>
  )
}
