'use client'

import { useSelection } from '@payloadcms/ui'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'

type Counts = {
  items: { all: number; published: number; draft: number; hidden: number }
  submissions: { all: number; pending: number; approved: number; rejected: number }
}

const statusQuery = (value: string) => `?where[status][equals]=${value}`

export function SubmissionsToolbar() {
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
  const [pendingItem, setPendingItem] = useState<string | null>(null)

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

  const itemsBase = pathname.replace(/\/submissions\/?$/, '/items')
  const itemsTabs = [
    { key: 'items-all', label: '全部', href: itemsBase, count: counts?.items.all },
    {
      key: 'items-published',
      label: '已发布',
      href: `${itemsBase}${statusQuery('published')}`,
      count: counts?.items.published,
    },
    { key: 'items-draft', label: '草稿', href: `${itemsBase}${statusQuery('draft')}`, count: counts?.items.draft },
    {
      key: 'items-hidden',
      label: '已隐藏',
      href: `${itemsBase}${statusQuery('hidden')}`,
      count: counts?.items.hidden,
    },
    {
      key: 'submissions',
      label: '投稿审核',
      href: `${pathname}${statusQuery('pending')}`,
      count: counts?.submissions.pending,
    },
  ]

  const statusTabs = [
    { key: 'all', label: '全部投稿', href: pathname, count: counts?.submissions.all },
    {
      key: 'pending',
      label: '待审核',
      href: `${pathname}${statusQuery('pending')}`,
      count: counts?.submissions.pending,
    },
    {
      key: 'approved',
      label: '已通过',
      href: `${pathname}${statusQuery('approved')}`,
      count: counts?.submissions.approved,
    },
    {
      key: 'rejected',
      label: '已拒绝',
      href: `${pathname}${statusQuery('rejected')}`,
      count: counts?.submissions.rejected,
    },
  ]

  const goItem = (key: string, href: string) => {
    if (isPending) return
    setPendingItem(key)
    startTransition(() => router.push(href, { scroll: false }))
  }

  const goStatus = (key: string, href: string) => {
    if (isPending || key === active) return
    setActive(key)
    startTransition(() => router.push(href, { scroll: false }))
  }

  const applyStatus = async (status: 'approved' | 'rejected') => {
    if (!count || busy) return

    const label = status === 'approved' ? '通过' : '拒绝'
    const scope = selectAll === 'allAvailable' ? '当前筛选下的全部' : '选中的'
    if (!window.confirm(`确定${label}${scope} ${count} 条投稿吗？`)) return

    setBusy(true)
    setMessage('')
    try {
      const body: { status: string; ids?: (string | number)[]; query?: string } = { status }
      if (selectAll === 'allAvailable') body.query = getQueryParams()
      else body.ids = selectedIDs

      const res = await fetch('/api/admin/submissions/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '操作失败')

      setMessage(`已${label} ${data.updated} 条投稿`)
      await loadCounts()
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="shelfry-admin-list-tools shelfry-admin-list-tools--submissions">
      <Link href={itemsBase} className="shelfry-admin-back">
        <ArrowLeft size={13} />
        软件条目
      </Link>

      <nav className="shelfry-admin-tabs shelfry-admin-tabs--full" aria-label="软件条目状态">
        {itemsTabs.map((tab) => {
          const selected = pendingItem ? pendingItem === tab.key : tab.key === 'submissions'
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => goItem(tab.key, tab.href)}
              onMouseEnter={() => router.prefetch(tab.href)}
              aria-pressed={selected}
              className={`shelfry-admin-tab${selected ? ' is-active' : ''}`}
            >
              {tab.label}
              {typeof tab.count === 'number' ? (
                <span className="shelfry-admin-tab__count">{tab.count}</span>
              ) : null}
            </button>
          )
        })}
      </nav>

      <nav className="shelfry-admin-tabs shelfry-admin-tabs--sub" aria-label="投稿状态">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => goStatus(tab.key, tab.href)}
            onMouseEnter={() => router.prefetch(tab.href)}
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
          {count > 0 ? `已选择 ${count} 条` : '勾选后可批量审核'}
        </span>
        <button
          type="button"
          className="shelfry-admin-action shelfry-admin-action--primary"
          disabled={!count || busy}
          onClick={() => void applyStatus('approved')}
        >
          通过
        </button>
        <button
          type="button"
          className="shelfry-admin-action shelfry-admin-action--danger"
          disabled={!count || busy}
          onClick={() => void applyStatus('rejected')}
        >
          拒绝
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
