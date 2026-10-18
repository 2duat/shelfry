'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { cn } from '@/lib/utils'

type TabValue = 'all' | 'featured' | 'editors'

export function ProjectTabs({
  counts,
}: {
  counts: { all: number; featured: number; editors: number }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = (searchParams.get('pick') as TabValue) || 'all'
  const [active, setActive] = useState<TabValue>(current)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setActive(current)
  }, [current])

  const tabs: Array<{ value: TabValue; label: string; count: number }> = [
    { value: 'all', label: '全部', count: counts.all },
    { value: 'featured', label: '精选推荐', count: counts.featured },
    { value: 'editors', label: '编辑精选', count: counts.editors },
  ]

  const go = (value: TabValue) => {
    if (isPending || value === active) return

    const next = new URLSearchParams(searchParams.toString())
    next.delete('page')
    if (value === 'all') next.delete('pick')
    else next.set('pick', value)
    const query = next.toString()

    // 先立即更新高亮，再让路由在后台加载
    setActive(value)
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
    })
  }

  return (
    <nav
      aria-label="项目范围"
      aria-busy={isPending}
      className={cn(
        'flex flex-wrap items-center gap-1.5 rounded-[14px] border border-line bg-surface p-1.5 transition-opacity',
        isPending && 'opacity-70',
      )}
    >
      {tabs.map((tab) => {
        const selected = active === tab.value
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => go(tab.value)}
            aria-pressed={selected}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] transition',
              selected
                ? 'bg-ink font-medium text-canvas'
                : 'text-muted hover:bg-surface-soft hover:text-ink',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'tabular-nums text-[11px]',
                selected ? 'text-canvas/70' : 'text-muted/70',
              )}
            >
              {tab.count}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
