import { Star } from 'lucide-react'
import Link from 'next/link'

import { ItemIcon } from '@/components/item-icon'
import { KINDS, labelOf, PLATFORMS } from '@/lib/constants'
import { cn, formatCompact } from '@/lib/utils'

export function PlatformChip({ value }: { value: string }) {
  const meta = PLATFORMS.find((platform) => platform.value === value)
  return (
    <span className="rounded-[5px] border border-line bg-surface-soft px-1.5 py-0.5 text-[10.5px] font-medium text-muted">
      {meta?.label ?? value}
    </span>
  )
}

export function Stars({ value }: { value?: number | null }) {
  return (
    <span className="inline-flex items-center gap-1 text-[12px] tabular-nums text-muted">
      <Star size={12} className="text-star" strokeWidth={2.4} />
      {formatCompact(value || 0)}
    </span>
  )
}

export function ItemCard({
  item,
  size = 'default',
  className,
}: {
  item: any
  size?: 'default' | 'large'
  className?: string
}) {
  const platforms: string[] = Array.isArray(item.platforms) ? item.platforms : []

  return (
    <Link
      href={`/p/${item.slug}`}
      className={cn(
        'group relative flex flex-col rounded-[18px] border border-line bg-surface p-5 transition duration-200',
        'hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card',
        size === 'large' && 'p-6',
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <ItemIcon src={item.iconUrl} name={item.name} size={size === 'large' ? 52 : 44} />
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              'truncate font-semibold tracking-[-0.01em] text-ink',
              size === 'large' ? 'text-[17px]' : 'text-[15px]',
            )}
          >
            {item.name}
          </h3>
          <p className="mt-0.5 truncate text-[11.5px] text-muted">
            {labelOf(KINDS, item.kind)}
            {item.language ? ` · ${item.language}` : ''}
          </p>
        </div>
        <Stars value={item.stars} />
      </div>

      <p
        className={cn(
          'mt-3.5 line-clamp-2 text-[13px] leading-relaxed text-muted',
          size === 'large' && 'text-[13.5px]',
        )}
      >
        {item.tagline || item.summary || '一个值得关注的开源项目'}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {platforms.slice(0, 3).map((platform) => (
          <PlatformChip key={platform} value={platform} />
        ))}
        {item.pricing === 'open-source' ? (
          <span className="rounded-[5px] bg-emerald-500/10 px-1.5 py-0.5 text-[10.5px] font-medium text-emerald-600 dark:text-emerald-400">
            开源
          </span>
        ) : null}
      </div>
    </Link>
  )
}
