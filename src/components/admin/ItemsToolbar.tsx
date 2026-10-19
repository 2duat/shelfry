'use client'

import { useSelection } from '@payloadcms/ui'
import { Loader2, Sparkles } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'

type Counts = {
  items: {
    all: number
    published: number
    draft: number
    hidden: number
    aiComplete: number
    aiPending: number
  }
  submissions: { pending: number }
}

export function ItemsToolbar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { count = 0, getQueryParams, selectAll, selectedIDs } = useSelection()
  const [counts, setCounts] = useState<Counts | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const currentStatus = searchParams.get('where[status][equals]')
  const currentAi = searchParams.get('where[aiEnriched][equals]')
  const activeKey = currentAi === 'false' ? 'ai-pending' : currentAi === 'true' ? 'ai-done' : currentStatus || 'all'
  const [active, setActive] = useState(activeKey)

  useEffect(() => {
    setActive(activeKey)
  }, [activeKey])

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

  const buildHref = (options: { status?: string; ai?: 'true' | 'false' }) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    params.delete('where[status][equals]')
    params.delete('where[aiEnriched][equals]')
    if (options.status) params.set('where[status][equals]', options.status)
    if (options.ai) params.set('where[aiEnriched][equals]', options.ai)
    const query = params.toString()
    return query ? `${pathname}?${query}` : pathname
  }

  const queryString = (options: { ai?: 'true' | 'false' } = {}) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    params.delete('where[status][equals]')
    if (options.ai) params.set('where[aiEnriched][equals]', options.ai)
    else params.delete('where[aiEnriched][equals]')
    const query = params.toString()
    return query ? `?${query}` : ''
  }

  const submissionsBase = pathname.replace(/\/items\/?$/, '/submissions')
  const tabs = [
    { key: 'all', label: '全部', href: buildHref({}), count: counts?.items.all },
    {
      key: 'published',
      label: '已发布',
      href: buildHref({ status: 'published' }),
      count: counts?.items.published,
    },
    { key: 'draft', label: '草稿', href: buildHref({ status: 'draft' }), count: counts?.items.draft },
    {
      key: 'hidden',
      label: '已隐藏',
      href: buildHref({ status: 'hidden' }),
      count: counts?.items.hidden,
    },
    {
      key: 'ai-pending',
      label: 'AI 未补全',
      href: buildHref({ ai: 'false' }),
      count: counts?.items.aiPending,
    },
    {
      key: 'ai-done',
      label: 'AI 已补全',
      href: buildHref({ ai: 'true' }),
      count: counts?.items.aiComplete,
    },
    {
      key: 'submissions-pending',
      label: '待审投稿',
      href: `${submissionsBase}?where[status][equals]=pending`,
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

  const applyEnrich = async (all = false) => {
    const target = all ? counts?.items.aiPending || 0 : count
    if (!target || busy) return

    const label = all ? `全部 ${target} 个未补全项目` : `选中的 ${target} 个项目`
    if (!window.confirm(`确定把${label}加入 AI 补全队列吗？`)) return

    setBusy(true)
    setMessage('')
    try {
      const body: { ids?: (string | number)[]; query?: string } = {}
      if (all) body.query = queryString({ ai: 'false' })
      else if (selectAll === 'allAvailable') body.query = getQueryParams()
      else body.ids = selectedIDs

      const res = await fetch('/api/admin/items/bulk-enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '操作失败')

      setMessage(`已加入补全队列 ${data.queued} 条，稍后刷新查看`)
      window.setTimeout(() => void loadCounts(), 5000)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败')
    } finally {
      setBusy(false)
    }
  }

  const showEnrichAll = active === 'ai-pending' && (counts?.items.aiPending || 0) > 0

  return (
    <div className="shelfry-admin-list-tools">
      <nav className="shelfry-admin-tabs" aria-label="软件条目状态">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => go(tab.key, tab.href)}
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
          {count > 0 ? `已选择 ${count} 项` : '勾选后可批量操作'}
        </span>

        <button
          type="button"
          className="shelfry-admin-action"
          disabled={!count || busy}
          onClick={() => void applyEnrich(false)}
        >
          <Sparkles size={12} />
          补全
        </button>

        {showEnrichAll ? (
          <button
            type="button"
            className="shelfry-admin-action"
            disabled={busy}
            onClick={() => void applyEnrich(true)}
          >
            一键补全全部 {counts?.items.aiPending}
          </button>
        ) : null}

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
