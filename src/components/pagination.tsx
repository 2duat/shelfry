import Link from 'next/link'

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number
  totalPages: number
  basePath: string
  searchParams: Record<string, string | string[] | undefined>
}) {
  if (totalPages <= 1) return null

  function href(target: number) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === 'page' || value == null) continue
      params.set(key, Array.isArray(value) ? value[0] : value)
    }
    if (target > 1) params.set('page', String(target))
    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  const pages: number[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  for (let index = start; index <= end; index += 1) pages.push(index)

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="分页">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className="rounded-full border border-line px-3.5 py-1.5 text-[12.5px] text-muted transition hover:text-ink"
        >
          上一页
        </Link>
      ) : null}

      {pages.map((index) => (
        <Link
          key={index}
          href={href(index)}
          aria-current={index === page ? 'page' : undefined}
          className={
            index === page
              ? 'grid size-8 place-items-center rounded-full bg-ink text-[12.5px] font-medium text-canvas'
              : 'grid size-8 place-items-center rounded-full text-[12.5px] text-muted transition hover:bg-surface-soft hover:text-ink'
          }
        >
          {index}
        </Link>
      ))}

      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          className="rounded-full border border-line px-3.5 py-1.5 text-[12.5px] text-muted transition hover:text-ink"
        >
          下一页
        </Link>
      ) : null}
    </nav>
  )
}
