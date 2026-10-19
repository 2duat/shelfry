'use client'

import { useSelection } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

type Counts = {
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

  const currentStatus = searchParams.get('where[status][equals]')
  const tabs = [
    { key: 'all', label: '全部', href: pathname, count: counts?.submissions.all },
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
    <div className="shelfry-admin-list-tools">
      <nav className="shelfry-admin-tabs" aria-label="投稿状态">
        {tabs.map((tab) => {
          const active =
            tab.key === 'all' ? !currentStatus : currentStatus === tab.key
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`shelfry-admin-tab${active ? ' is-active' : ''}`}
            >
              {tab.label}
              {typeof tab.count === 'number' ? (
                <span className="shelfry-admin-tab__count">{tab.count}</span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="shelfry-admin-bulk">
        <span className="shelfry-admin-selection">
          {count > 0 ? `已选择 ${count} 条` : '勾选投稿后可批量审核'}
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
        {message ? <span className="shelfry-admin-message">{message}</span> : null}
      </div>
    </div>
  )
}
