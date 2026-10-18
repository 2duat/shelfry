'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'

import { KINDS, PLATFORMS, PRICINGS, SORTS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const STAR_OPTIONS = [
  { value: 'all', label: '不限星标' },
  { value: '100', label: '100+' },
  { value: '1000', label: '1k+' },
  { value: '5000', label: '5k+' },
  { value: '10000', label: '10k+' },
]

export function FilterBar({ hideKind = false }: { hideKind?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const base = {
    platform: searchParams.get('platform') || 'all',
    kind: searchParams.get('kind') || 'all',
    pricing: searchParams.get('pricing') || 'all',
    sort: searchParams.get('sort') || 'recommended',
    stars: searchParams.get('stars') || 'all',
  }
  const [filters, setFilters] = useState(base)

  useEffect(() => {
    if (!isPending) setFilters(base)
  }, [isPending, searchParams])

  const setParam = useCallback(
    (key: keyof typeof base, value: string) => {
      if (isPending) return

      const next = new URLSearchParams(searchParams.toString())
      if (!value || value === 'all') next.delete(key)
      else next.set(key, value)
      next.delete('page')
      const query = next.toString()

      startTransition(() => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
      })
    },
    [isPending, pathname, router, searchParams, startTransition],
  )

  const { platform, kind, pricing, sort, stars } = filters

  return (
    <div
      aria-busy={isPending}
      className={`rounded-[16px] border border-line bg-surface p-2.5 transition-opacity ${isPending ? 'pointer-events-none opacity-60' : ''}`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip active={platform === 'all'} onClick={() => setParam('platform', 'all')}>
          全部平台
        </FilterChip>
        {PLATFORMS.slice(0, 4).map((item) => (
          <FilterChip
            key={item.value}
            active={platform === item.value}
            onClick={() => setParam('platform', item.value)}
          >
            {item.label}
          </FilterChip>
        ))}

        <div className="mx-1 hidden h-5 w-px bg-line sm:block" />

        <select
          value={sort}
          onChange={(event) => setParam('sort', event.target.value)}
          aria-label="排序"
          className="h-8 rounded-full border border-line bg-surface-soft px-3 text-[12.5px] text-ink-soft outline-none"
        >
          {SORTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <select
          value={stars}
          onChange={(event) => setParam('stars', event.target.value)}
          aria-label="星标筛选"
          className="h-8 rounded-full border border-line bg-surface-soft px-3 text-[12.5px] text-ink-soft outline-none"
        >
          {STAR_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <select
          value={pricing}
          onChange={(event) => setParam('pricing', event.target.value)}
          aria-label="收费模式"
          className="h-8 rounded-full border border-line bg-surface-soft px-3 text-[12.5px] text-ink-soft outline-none"
        >
          <option value="all">全部收费模式</option>
          {PRICINGS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {!hideKind ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-line pt-2.5">
          <FilterChip active={kind === 'all'} onClick={() => setParam('kind', 'all')}>
            全部类型
          </FilterChip>
          {KINDS.slice(0, 6).map((item) => (
            <FilterChip
              key={item.value}
              active={kind === item.value}
              onClick={() => setParam('kind', item.value)}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-8 rounded-full px-3 text-[12.5px] transition',
        active
          ? 'bg-ink text-canvas font-medium'
          : 'text-muted hover:bg-surface-soft hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
