import { Suspense } from 'react'

import { FilterBar } from '@/components/filter-bar'
import { ItemCard } from '@/components/item-card'
import { Pagination } from '@/components/pagination'
import { listItems } from '@/lib/queries'

type SearchParams = Record<string, string | string[] | undefined>

export async function ListingView({
  title,
  subtitle,
  basePath,
  fixedKinds,
  fixedPlatform,
  hideKind = false,
  searchParams,
  emptyHint,
}: {
  title: string
  subtitle?: string
  basePath: string
  fixedKinds?: string[]
  fixedPlatform?: string
  hideKind?: boolean
  searchParams: SearchParams
  emptyHint?: string
}) {
  const page = Math.max(1, Number(searchParams.page) || 1)
  const platform =
    fixedPlatform || (typeof searchParams.platform === 'string' ? searchParams.platform : undefined)
  const kindParam = typeof searchParams.kind === 'string' ? searchParams.kind : undefined
  const kind = kindParam || (fixedKinds?.length ? fixedKinds : undefined)
  const pricing = typeof searchParams.pricing === 'string' ? searchParams.pricing : undefined
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'recommended'
  const starsParam = typeof searchParams.stars === 'string' ? searchParams.stars : undefined
  const minStars = starsParam ? Number(starsParam) : undefined

  const result = await listItems({
    platform,
    kind,
    pricing,
    sort,
    minStars,
    page,
    limit: 24,
  })

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-6 pt-12 md:px-8">
      <header className="max-w-2xl">
        <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-ink md:text-[40px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2.5 text-[14px] leading-relaxed text-muted md:text-[15px]">{subtitle}</p>
        ) : null}
        <p className="mt-2 text-[12px] text-muted">
          共 <span className="tabular-nums text-ink-soft">{result.totalDocs}</span> 个条目
        </p>
      </header>

      <div className="mt-6">
        <Suspense fallback={<div className="h-[92px] rounded-[16px] border border-line bg-surface" />}>
          <FilterBar hideKind={hideKind} />
        </Suspense>
      </div>

      {result.docs.length ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(result.docs as any[]).map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[18px] border border-dashed border-line bg-surface/50 px-6 py-16 text-center">
          <h2 className="text-[16px] font-medium text-ink">这个筛选下还没有条目</h2>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
            {emptyHint || '换个筛选条件试试，或者到后台导入新的 GitHub 项目。'}
          </p>
        </div>
      )}

      <Pagination
        page={result.page || page}
        totalPages={result.totalPages || 0}
        basePath={basePath}
        searchParams={searchParams}
      />
    </div>
  )
}
