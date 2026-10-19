'use client'

import { useSelection } from '@payloadcms/ui'
import { Loader2 } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'

type Counts = {
  items: { all: number; published: number; draft: number; hidden: number }
  submissions: { pending: number }
}

const statusQuery = (value: string) => `?where[status][equals]=${value}`

export function ItemsToolbar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { count = 0, getQueryParams, selectAll, selectedIDs } = useSelection()
  const [counts, setCounts] = useState<Counts | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const currentStatus = searchParams.get('where[status][equals]') || 'all'
  const [active, setActive] = useState(currentStatus)

  useEffect(() => {
    setActive(currentStatus)
  }, [currentStatus])

  const loadCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/item-counts', { cache: 'no-store' })
      if (res.ok) setCounts((await res.json()) as Counts)
    } catch {
      /* 计数失败不影响列表 */
    }
  }, [])

  useEffect(() => {
    void loadCounts()
  }, [loadCounts])

  const submissionsBase = pathname.replace(/\/items\/?$/, '/submissions')
  const tabs = [
    { key: 'all', label: '全部', href: pathname, count: counts?.items.all },
    {
      key: 'published',
      label: '已发布',
      href: `${pathname}${statusQuery('published')}`,
      count: counts?.items.published,
    },
    { key: 'draft', label: '草稿', href: `${pathname}${statusQuery('draft')}`, count: counts?.items.draft },
    {
      key: 'hidden',
      label: '已隐藏',
      href: `${pathname}${statusQuery('hidden')}`,
      count: counts?.items.hidden,
    },
    {
      key: 'pending',
      label: '待审投稿',
      href: `${submissionsBase}${statusQuery('pending')}`,
      count: counts?.submissions.pending,
    },
  ]

  const go = (key: string, href: string) => {
    if (isPending || key === active) return
    setActive(key)
    startTransition(() => router.push(href, { scroll: false }))
  }

  const applyStatus = async (status: 'published' | 'hidden') => {
    if (!count || busy) return

    const label = status === 'published' ? '发布' : '下架'
    const scope = selectAll === 'allAvailable' ? '当前筛选下的全部' : '选中的'
    if (!window.confirm(`确定${label}${scope} ${count} 个项目吗？`)) return

    setBusy(true)
    setMessage('')
    try {
      const body: { status: string; ids?: (string | number)[]; query?: string } = { status }
      if (selectAll === 'allAvailable') body.query = getQueryParams()
      else body.ids = selectedIDs

      const res = await fetch('/api/admin/items/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '操作失败')

      setMessage(`已${label} ${data.updated} 个项目`)
      await loadCounts()
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="shelfry-admin-list-tools">
      <nav className="shelfry-admin-tabs" aria-label="软件条目状态">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => go(tab.key, tab.href)}
            aria-pressed={active === tab.key}
            className={`shelfry-admin-tab${active === tab.key ? ' is-active' : ''}`}
          >
            {tab.label}
            {typeof tab.count === 'number' ? (
              <span className="shelfry-admin-tab__count">{tab.count}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="shelfry-admin-bulk">
        <span className="shelfry-admin-selection">
          {count > 0 ? `已选择 ${count} 项` : '勾选后可批量操作'}
        </span>
        <button
          type="button"
          className="shelfry-admin-action shelfry-admin-action--primary"
          disabled={!count || busy}
          onClick={() => void applyStatus('published')}
        >
          发布
        </button>
        <button
          type="button"
          className="shelfry-admin-action shelfry-admin-action--danger"
          disabled={!count || busy}
          onClick={() => void applyStatus('hidden')}
        >
          下架
        </button>
        {isPending ? (
          <span className="shelfry-admin-loading" aria-live="polite">
            <Loader2 size={12} className="animate-spin" />
            加载中
          </span>
        ) : message ? (
          <span className="shelfry-admin-message">{message}</span>
        ) : null}
      </div>
    </div>
  )
}
