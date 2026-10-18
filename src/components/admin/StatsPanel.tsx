'use client'

import {
  Activity,
  CheckCircle2,
  FileText,
  Inbox,
  Layers,
  Plus,
  RefreshCw,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

type Stats = {
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
  const diff = Date.now() - new Date(value).getTime()
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
    load()
  }, [load])

  if (error) {
    return (
      <div className="os-stats os-stats--error">
        数据加载失败：{error}
        <button type="button" onClick={load}>
          重试
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="os-stats">
        <div className="os-stats__head">
          <div className="os-stats__title">数据概览</div>
          <span className="os-stats__muted">{loading ? '加载中…' : ''}</span>
        </div>
      </div>
    )
  }

  const { totals, series, categories, platforms, lastSync } = data
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

  return (
    <div className="os-stats">
      <div className="os-stats__head">
        <div>
          <div className="os-stats__title">数据概览</div>
          <div className="os-stats__sub">
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
          </div>
        </div>
        <button type="button" className="os-stats__refresh" onClick={load} disabled={loading}>
          <RefreshCw size={13} className={loading ? 'os-spin' : ''} />
          刷新
        </button>
      </div>

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
    </div>
  )
}
