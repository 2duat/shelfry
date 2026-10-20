'use client'

import {
  Activity,
  Boxes,
  CheckCircle2,
  FileText,
  Folder,
  History,
  Image as ImageIcon,
  Inbox,
  Layers,
  Package,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Tag,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

type Stats = {
  counts: {
    categories: number
    tags: number
    lists: number
    syncRuns: number
    media: number
    users: number
    submissions: number
  }
  totals: {
    total: number
    published: number
    drafts: number
    todayNew: number
    todayUpdated: number
    pendingSubmissions: number
    failedSync: number
  }
  series: Array<{ label: string; count: number }>
  categories: Array<{ name: string; count: number }>
  platforms: Array<{ platform: string; count: number }>
  lastSync: {
    type: string
    status: string
    finishedAt: string
    stats: Record<string, number> | null
  } | null
}

const PLATFORM_LABELS: Record<string, string> = {
  macos: 'macOS',
  windows: 'Windows',
  linux: 'Linux',
  web: 'Web',
  ios: 'iOS',
  android: 'Android',
}

const TASK_LABELS: Record<string, string> = {
  refresh: '刷新星标',
  discover: '自动发现',
  enrich: 'AI 补全',
  readme: 'README 补全',
  tags: '标签补全',
  import: '单条导入',
  seed: '初始化',
}

function timeAgo(value: string): string {
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return '时间未知'
  const diff = Date.now() - time
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  return `${Math.floor(hours / 24)} 天前`
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value)
}

export function StatsPanel() {
  const [data, setData] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/stats', { cache: 'no-store' })
      if (!response.ok) throw new Error('加载失败')
      setData((await response.json()) as Stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const heroActions = (
    <div className="shelfry-hero__actions">
      <button type="button" className="shelfry-hero__button" onClick={() => void load()} disabled={loading}>
        <RefreshCw size={13} className={loading ? 'os-spin' : ''} />
        刷新数据
      </button>
      <Link className="shelfry-hero__cta" href="/admin/collections/items/create">
        ＋ 新建条目
      </Link>
    </div>
  )

  // 仪表盘与所有列表页共用同一套 Hero，避免它是唯一没有页头的后台页面
  const renderHero = (description: React.ReactNode) => (
    <section className="list-header shelfry-hero">
      <div className="list-header__content">
        <div className="shelfry-hero__row">
          <div className="shelfry-hero__text">
            <span className="shelfry-hero__eyebrow">SHELFRY · 内容管理</span>
            <h1 className="shelfry-hero__title">数据概览</h1>
            <p className="shelfry-hero__desc">{description}</p>
          </div>
          {heroActions}
        </div>
      </div>
    </section>
  )

  if (error) {
    return (
      <div className="os-stats">
        {renderHero('内容、投稿与同步任务总览')}
        <div className="os-stats__error" role="alert">
          数据加载失败：{error}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="os-stats" role="status" aria-live="polite">
        {renderHero('内容、投稿与同步任务总览')}
      </div>
    )
  }

  const { totals, counts, series, categories, platforms, lastSync } = data
  const maxSeries = Math.max(1, ...series.map((item) => item.count))
  const maxCategory = Math.max(1, ...categories.map((item) => item.count))

  const cards = [
    { label: '总项目', value: totals.total, icon: Layers, hint: `收录 ${formatNumber(totals.total)} 条` },
    { label: '已发布', value: totals.published, icon: CheckCircle2, hint: `草稿 ${formatNumber(totals.drafts)}` },
    { label: '今日新增', value: totals.todayNew, icon: Plus, hint: '按收录时间' },
    { label: '今日更新', value: totals.todayUpdated, icon: RefreshCw, hint: '含自动同步' },
    { label: '草稿', value: totals.drafts, icon: FileText, hint: '等待审核发布' },
    { label: '待审投稿', value: totals.pendingSubmissions, icon: Inbox, hint: totals.pendingSubmissions ? '需要处理' : '暂无' },
  ]

  const quickLinks = [
    {
      name: '软件条目',
      href: '/admin/collections/items',
      create: '/admin/collections/items/create',
      count: totals.total,
      icon: Package,
    },
    {
      name: '分类',
      href: '/admin/collections/categories',
      create: '/admin/collections/categories/create',
      count: counts.categories,
      icon: Folder,
    },
    {
      name: '标签',
      href: '/admin/collections/tags',
      create: '/admin/collections/tags/create',
      count: counts.tags,
      icon: Tag,
    },
    {
      name: '合集',
      href: '/admin/collections/curated-lists',
      create: '/admin/collections/curated-lists/create',
      count: counts.lists,
      icon: Boxes,
    },
    {
      name: '投稿',
      href: '/admin/collections/submissions',
      create: null,
      count: counts.submissions,
      icon: Inbox,
    },
    {
      name: '同步记录',
      href: '/admin/collections/sync-runs',
      create: null,
      count: counts.syncRuns,
      icon: History,
    },
    {
      name: '媒体库',
      href: '/admin/collections/media',
      create: '/admin/collections/media/create',
      count: counts.media,
      icon: ImageIcon,
    },
    {
      name: '管理员',
      href: '/admin/collections/users',
      create: '/admin/collections/users/create',
      count: counts.users,
      icon: Users,
    },
    {
      name: '站点设置',
      href: '/admin/globals/settings',
      create: null,
      count: null,
      icon: SlidersHorizontal,
    },
  ]

  return (
    <div className="os-stats">
      {renderHero(
        <>
          {lastSync ? (
            <>
              最近同步：{TASK_LABELS[lastSync.type] || lastSync.type} ·{' '}
              {lastSync.status === 'success' ? '成功' : lastSync.status === 'failed' ? '失败' : '运行中'} ·{' '}
              {timeAgo(lastSync.finishedAt)}
            </>
          ) : (
            '还没有同步记录'
          )}
          {totals.failedSync > 0 ? (
            <span className="os-stats__alert"> · 失败 {totals.failedSync} 次</span>
          ) : null}
        </>,
      )}

      <div className="os-stats__grid">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div className="os-stat" key={card.label}>
              <div className="os-stat__label">
                <Icon size={13} />
                {card.label}
              </div>
              <div className="os-stat__value">{formatNumber(card.value)}</div>
              <div className="os-stat__hint">{card.hint}</div>
            </div>
          )
        })}
      </div>

      <div className="os-stats__panels">
        <div className="os-panel">
          <div className="os-panel__title">近 7 天新增</div>
          <div className="os-bars">
            {series.map((item) => (
              <div className="os-bar" key={item.label}>
                <div className="os-bar__count">{item.count || ''}</div>
                <div
                  className="os-bar__fill"
                  style={{
                    height: item.count ? `${Math.max(6, (item.count / maxSeries) * 100)}%` : '2px',
                    opacity: item.count ? 1 : 0.25,
                  }}
                />
                <div className="os-bar__label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="os-panel">
          <div className="os-panel__title">分类分布</div>
          <div className="os-cats">
            {categories.length ? (
              categories.map((item) => (
                <div className="os-cat" key={item.name}>
                  <span className="os-cat__name">{item.name}</span>
                  <span className="os-cat__track">
                    <span
                      className="os-cat__fill"
                      style={{ width: `${Math.max(6, (item.count / maxCategory) * 100)}%` }}
                    />
                  </span>
                  <span className="os-cat__count">{item.count}</span>
                </div>
              ))
            ) : (
              <div className="os-stats__muted">暂无数据</div>
            )}
          </div>
        </div>

        <div className="os-panel">
          <div className="os-panel__title">平台分布</div>
          <div className="os-platforms">
            {platforms.map((item) => (
              <span className="os-platform" key={item.platform}>
                <Activity size={12} />
                {PLATFORM_LABELS[item.platform] || item.platform}
                <strong>{item.count}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="os-quick">
        <div className="os-quick__head">
          <div className="os-panel__title">快捷入口</div>
          <span className="os-stats__muted">共 {quickLinks.length} 个模块</span>
        </div>
        <div className="os-quick__grid">
          {quickLinks.map((item) => {
            const Icon = item.icon
            return (
              <div className="os-quick__tile" key={item.name}>
                <Link className="os-quick__main" href={item.href}>
                  <span className="os-quick__icon">
                    <Icon size={15} />
                  </span>
                  <span className="os-quick__text">
                    <span className="os-quick__name">{item.name}</span>
                    <span className="os-quick__count">
                      {item.count === null ? '配置' : `${formatNumber(item.count)} 条`}
                    </span>
                  </span>
                </Link>
                {item.create ? (
                  <Link className="os-quick__add" href={item.create} aria-label={`新建${item.name}`}>
                    +
                  </Link>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
