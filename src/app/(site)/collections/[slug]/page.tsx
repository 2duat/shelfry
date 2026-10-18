import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ItemIcon } from '@/components/item-icon'
import { PlatformChip, Stars } from '@/components/item-card'
import { TrafficLights } from '@/components/traffic-lights'
import { getCollectionBySlug } from '@/lib/queries'
import { formatDate, truncate } from '@/lib/utils'

export const revalidate = 300

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const list = await getCollectionBySlug(slug)
  if (!list) return { title: '合集未找到' }
  return {
    title: list.title,
    description: list.intro || `${list.title} — 编辑整理的开源软件清单。`,
    alternates: { canonical: `/collections/${slug}` },
  }
}

export default async function CollectionDetailPage({ params }: Params) {
  const { slug } = await params
  const list = await getCollectionBySlug(slug)
  if (!list) notFound()

  const entries = (Array.isArray(list.entries) ? list.entries : [])
    .map((entry: any) => ({
      note: entry.note as string | undefined,
      item: typeof entry.item === 'object' ? entry.item : null,
    }))
    .filter((entry: any) => entry.item?.slug)

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-10 pt-8 md:px-8">
      <nav className="flex items-center gap-1.5 text-[12px] text-muted">
        <Link href="/" className="transition hover:text-ink">
          首页
        </Link>
        <span className="text-line-strong">/</span>
        <Link href="/collections" className="transition hover:text-ink">
          合集
        </Link>
      </nav>

      <header className="mt-6">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
          Collection
        </div>
        <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.03em] md:text-[40px]">
          {list.title}
        </h1>
        {list.intro ? (
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-muted">{list.intro}</p>
        ) : null}
        <p className="mt-3 text-[12px] text-muted">
          {entries.length} 个条目 · 更新于 {formatDate(list.updatedAt)}
        </p>
      </header>

      <div className="mt-8 overflow-hidden rounded-[18px] border border-line bg-surface shadow-window">
        <div className="flex items-center gap-2 border-b border-line bg-surface-soft/70 px-4 py-2.5">
          <TrafficLights />
          <div className="mx-auto text-[11px] text-muted">Shelfry · 合集</div>
          <div className="w-10" />
        </div>

        <ol>
          {entries.map((entry: any, index: number) => {
            const item = entry.item
            return (
              <li key={item.id} className="border-b border-line last:border-b-0">
                <Link
                  href={`/p/${item.slug}`}
                  className="group flex items-start gap-4 px-5 py-4 transition hover:bg-surface-soft"
                >
                  <span className="mt-1 w-6 shrink-0 font-mono text-[12px] text-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <ItemIcon src={item.iconUrl} name={item.name} size={42} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-medium text-ink">{item.name}</span>
                      {(item.platforms || []).slice(0, 2).map((platform: string) => (
                        <PlatformChip key={platform} value={platform} />
                      ))}
                      <Stars value={item.stars} />
                    </span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-muted">
                      {entry.note || truncate(item.tagline || item.summary || '', 90)}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
