'use client'

import { useListQuery } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function EmptyListState() {
  const { data } = useListQuery()
  const pathname = usePathname()

  if (!data || data.docs?.length) return null

  return (
    <div className="shelfry-empty-table" role="status">
      <div className="shelfry-empty-table__head">
        <span>名称</span>
        <span>类型</span>
        <span>状态</span>
        <span>Stars</span>
        <span>更新于</span>
      </div>
      <div className="shelfry-empty-table__body">
        <div>
          <strong>没有结果。</strong>
          <p>要么不存在，要么与您以上指定的过滤器不匹配。</p>
        </div>
        <Link href={`${pathname}/create`} className="shelfry-empty-table__create">
          创建新的软件条目
        </Link>
      </div>
    </div>
  )
}
