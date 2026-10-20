'use client'

import { useAuth, useConfig, useListQuery } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Field } from 'payload'
import React from 'react'

const SYSTEM_LABELS: Record<string, string> = {
  id: 'ID',
  createdAt: '创建时间',
  updatedAt: '更新时间',
}

/** 把 tabs / rows / collapsible 里的字段摊平，用于按 defaultColumns 找中文标签 */
function collectFieldLabels(fields: Field[] | undefined, out: Record<string, string> = {}) {
  for (const field of fields || []) {
    const name = (field as { name?: string }).name
    const label = (field as { label?: unknown }).label
    if (name && !out[name]) {
      out[name] = typeof label === 'string' && label ? label : name
    }
    const nested = (field as { fields?: Field[] }).fields
    if (Array.isArray(nested)) collectFieldLabels(nested, out)
    const tabs = (field as { tabs?: Array<{ fields?: Field[] }> }).tabs
    if (Array.isArray(tabs)) {
      for (const tab of tabs) collectFieldLabels(tab.fields, out)
    }
  }
  return out
}

/**
 * 空列表状态：列头跟随集合的 defaultColumns，不再写死列数。
 * 目前只挂在 items / submissions 上，后续可直接复用到其他集合。
 */
export function EmptyListState() {
  const { data } = useListQuery()
  const { config } = useConfig()
  const { user } = useAuth()
  const pathname = usePathname()

  if (!data || data.docs?.length) return null

  const slug = pathname.match(/\/collections\/([^/]+)/)?.[1]
  const collection = config?.collections?.find((item) => item.slug === slug)
  const labels = collectFieldLabels(collection?.fields as Field[] | undefined)
  const columnNames =
    (collection?.admin?.defaultColumns as string[] | undefined) || ['name', 'status', 'updatedAt']
  const columns = columnNames.map((name) => labels[name] || SYSTEM_LABELS[name] || name)

  const singular = collection?.labels?.singular
  const singularLabel = typeof singular === 'string' ? singular : '条目'
  // submissions 不允许后台新建；users 只有 admin 能建
  const isAdmin = (user as { role?: string } | null)?.role === 'admin'
  const canCreate =
    Boolean(user) && slug !== 'submissions' && (slug !== 'users' || isAdmin)

  return (
    <div className="shelfry-empty-table" role="status">
      <div
        className="shelfry-empty-table__head"
        style={{
          gridTemplateColumns: `minmax(220px, 1.6fr) ${columns
            .slice(1)
            .map(() => '1fr')
            .join(' ')}`.trim(),
        }}
      >
        {columns.map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>
      <div className="shelfry-empty-table__body">
        <div>
          <strong>没有结果。</strong>
          <p>要么不存在，要么与您以上指定的过滤器不匹配。</p>
        </div>
        {canCreate ? (
          <Link href={`${pathname}/create`} className="shelfry-empty-table__create">
            创建新的{singularLabel}
          </Link>
        ) : null}
      </div>
    </div>
  )
}
