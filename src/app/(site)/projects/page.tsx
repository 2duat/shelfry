import Link from 'next/link'
import type { Metadata } from 'next'

import { ListingView } from '@/components/listing-view'
import { getProjectCounts } from '@/lib/queries'
import { cn } from '@/lib/utils'

export const revalidate = 120

export const metadata: Metadata = {
  title: '全部项目',
  description: '浏览 Shelfry 收录的全部开源软件、AI 工具、MCP Server 与插件，支持按平台、类型和定价筛选。',
  alternates: { canonical: '/projects' },
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const rawPick = typeof sp.pick === 'string' ? sp.pick : ''
  const pick =
    rawPick === 'featured' || rawPick === 'editors' ? (rawPick as 'featured' | 'editors') : undefined

  const counts = await getProjectCounts()

  const base = new URLSearchParams()
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === 'string' && key !== 'pick' && key !== 'page') base.set(key, value)
  }

  const hrefFor = (value?: 'featured' | 'editors') => {
    const params = new URLSearchParams(base)
    if (value) params.set('pick', value)
    const qs = params.toString()
    return qs ? `/projects?${qs}` : '/projects'
  }

  const tabs = [
    { value: undefined, label: '全部', count: counts.all },
    { value: 'featured' as const, label: '精选推荐', count: counts.featured },
    { value: 'editors' as const, label: '编辑精选', count: counts.editors },
  ]

  return (
    <ListingView
      title="全部项目"
      subtitle="按平台、类型、定价筛选，找到适合你的开源工具。"
      basePath="/projects"
      pick={pick}
      searchParams={sp}
      tabs={
        <nav className="flex flex-wrap items-center gap-1.5 rounded-[14px] border border-line bg-surface p-1.5">
          {tabs.map((tab) => {
            const active = (pick || 'all') === (tab.value || 'all')
            return (
              <Link
                key={tab.value || 'all'}
                href={hrefFor(tab.value)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] transition',
                  active
                    ? 'bg-ink font-medium text-canvas'
                    : 'text-muted hover:bg-surface-soft hover:text-ink',
                )}
              >
                {tab.label}
                <span className={cn('tabular-nums text-[11px]', active ? 'text-canvas/70' : 'text-muted/70')}>
                  {tab.count}
                </span>
              </Link>
            )
          })}
        </nav>
      }
    />
  )
}
