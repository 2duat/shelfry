import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = '查看全部',
}: {
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink md:text-[26px]">
          {title}
        </h2>
        {subtitle ? <p className="mt-1.5 text-[13.5px] text-muted">{subtitle}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-[13px] text-muted transition hover:text-accent"
        >
          {linkLabel}
          <ArrowUpRight size={14} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      ) : null}
    </div>
  )
}
