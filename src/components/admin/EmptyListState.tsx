'use client'

import { useListQuery } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function EmptyListState() {
  const { data } = useListQuery()
  const pathname = usePathname()
  const isSubmissions = pathname.includes('/collections/submissions')

  if (!data || data.docs?.length) return null

  return (
    <div className={`shelfry-empty-table${isSubmissions ? ' shelfry-empty-table--submissions' : ''}`} role="status">
      <div className="shelfry-empty-table__head">
        <span>{isSubmissions ? '仓库' : '名称'}</span>
        <span>{isSubmissions ? '名称' : '类型'}</span>
        <span>状态</span>
        <span>{isSubmissions ? '提交时间' : 'Stars'}</span>
        {!isSubmissions ? <span>更新于</span> : null}
      </div>
      <div className="shelfry-empty-table__body">
        <div>
          <strong>没有结果。</strong>
          <p>要么不存在，要么与您以上指定的过滤器不匹配。</p>
        </div>
        {!isSubmissions ? (
          <Link href={`${pathname}/create`} className="shelfry-empty-table__create">
            创建新的软件条目
          </Link>
        ) : null}
      </div>
    </div>
  )
}
