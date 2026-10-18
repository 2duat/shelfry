import { RichText } from '@payloadcms/richtext-lexical/react'
import {
  ArrowUpRight,
  Check,
  Clock,
  Download,
  ExternalLink,
  GitFork,
  Lock,
  Shield,
  Star,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CopyButton } from '@/components/copy-button'
import { GithubIcon } from '@/components/github-icon'
import { ItemCard, PlatformChip } from '@/components/item-card'
import { ItemIcon } from '@/components/item-icon'
import { ReadmeView } from '@/components/readme-view'
import { ScreenshotGallery } from '@/components/screenshot-gallery'
import { TrafficLights } from '@/components/traffic-lights'
import { KINDS, labelOf } from '@/lib/constants'
import { getItemBySlug, getRelatedItems } from '@/lib/queries'
import { formatCompact, formatDate, timeAgo } from '@/lib/utils'

export const revalidate = 300

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const item = await getItemBySlug(slug)
  if (!item) return { title: '未找到该条目' }

  const title = item.seo?.title || `${item.name} — ${item.tagline || '开源项目'}`
  const description =
    item.seo?.description || item.tagline || String(item.summary || '').slice(0, 120)

  return {
    title,
    description,
    alternates: { canonical: `/p/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      images: item.coverUrl ? [item.coverUrl] : undefined,
    },
  }
}

export default async function ItemPage({ params }: Params) {
  const { slug } = await params
  const item = await getItemBySlug(slug)
  if (!item) notFound()

  const related = await getRelatedItems(item, 3)
  const category = item.category && typeof item.category === 'object' ? item.category : null
  const tags: string[] = String(item.tagsText || '')
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
  const platforms: string[] = Array.isArray(item.platforms) ? item.platforms : []
  const features: Array<{ text: string }> = Array.isArray(item.features) ? item.features : []
  const shots: Array<{ url: string; caption?: string }> = Array.isArray(item.screenshots)
    ? item.screenshots
    : []
  const readme = typeof item.readme === 'string' ? item.readme.trim().slice(0, 60000) : ''
  const fullName =
    item.githubFullName ||
    String(item.repoUrl || '').match(/github\.com\/([^/]+)\/([^/?#]+)/)?.slice(1).join('/') ||
    ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: item.name,
    description: item.tagline || item.summary,
    applicationCategory: category?.name || 'Utilities',
    operatingSystem: platforms.join(', '),
    url: item.homepage || item.repoUrl,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    ...(item.stars ? { interactionStatistic: { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: item.stars } } : {}),
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-6 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="flex items-center gap-1.5 text-[12px] text-muted" aria-label="面包屑">
        <Link href="/" className="transition hover:text-ink">
          首页
        </Link>
        {category ? (
          <>
            <span className="text-line-strong">/</span>
            <Link href={`/category/${category.slug}`} className="transition hover:text-ink">
              {category.name}
            </Link>
          </>
        ) : null}
        <span className="text-line-strong">/</span>
        <span className="truncate text-ink-soft">{item.name}</span>
      </nav>

      <section className="mt-4 overflow-hidden rounded-[18px] border border-line bg-surface shadow-window">
        <div className="flex items-center gap-2 border-b border-line bg-surface-soft/70 px-4 py-2.5">
          <TrafficLights />
          <div className="mx-auto flex items-center gap-1.5 rounded-[7px] border border-line bg-surface px-2.5 py-1 text-[11px] text-muted">
            <Lock size={10} />
            <span className="max-w-[240px] truncate">openshelf.app/p/{item.slug}</span>
          </div>
          <div className="w-10" />
        </div>

        <div className="p-6 md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <ItemIcon src={item.iconUrl} name={item.name} size={78} className="rounded-[18px]" />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[28px] font-semibold tracking-[-0.035em] text-ink md:text-[36px]">
                  {item.name}
                </h1>
                {item.archived ? (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-600 dark:text-amber-400">
                    已归档
                  </span>
                ) : null}
                {item.editorsPick ? (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent">
                    编辑精选
                  </span>
                ) : null}
              </div>

              <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted md:text-[15px]">
                {item.tagline || '一个值得关注的开源项目。'}
              </p>

              {item.summary ? (
                <p className="mt-3 max-w-3xl text-[13.8px] leading-[1.8] text-ink-soft">
                  {item.summary}
                </p>
              ) : null}

              <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                {platforms.map((platform) => (
                  <PlatformChip key={platform} value={platform} />
                ))}
                <span className="rounded-[5px] border border-line bg-surface-soft px-1.5 py-0.5 text-[10.5px] font-medium text-muted">
                  {labelOf(KINDS, item.kind)}
                </span>
                {item.license ? (
                  <span className="inline-flex items-center gap-1 rounded-[5px] border border-line bg-surface-soft px-1.5 py-0.5 text-[10.5px] text-muted">
                    <Shield size={10} /> {item.license}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {item.homepage ? (
                <a
                  href={item.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-accent px-4 text-[13px] font-medium text-accent-ink transition hover:opacity-90"
                >
                  访问官网 <ArrowUpRight size={14} />
                </a>
              ) : null}
              {item.downloadUrl ? (
                <a
                  href={item.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-4 text-[13px] font-medium text-ink transition hover:bg-surface-soft"
                >
                  <Download size={14} /> 下载
                </a>
              ) : null}
              {item.repoUrl ? (
                <a
                  href={item.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-4 text-[13px] font-medium text-ink transition hover:bg-surface-soft"
                >
                  <GithubIcon size={15} /> GitHub
                </a>
              ) : null}
            </div>
          </div>

          {item.installCommand ? (
            <div className="mt-6 flex items-center gap-3 rounded-[10px] border border-line bg-surface-soft px-3.5 py-2.5">
              <span className="font-mono text-[11px] text-muted">$</span>
              <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[12.5px] text-ink-soft">
                {item.installCommand}
              </code>
              <CopyButton value={item.installCommand} />
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Metric icon={<Star size={13} />} label="Stars" value={formatCompact(item.stars)} />
            <Metric icon={<GitFork size={13} />} label="Forks" value={formatCompact(item.forks)} />
            <Metric
              icon={<ExternalLink size={13} />}
              label="语言"
              value={item.language || '—'}
            />
            <Metric
              icon={<Clock size={13} />}
              label="最近提交"
              value={timeAgo(item.lastCommitAt) || '—'}
            />
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_296px]">
        <div className="min-w-0">
          {shots.length ? (
            <section className="mt-10 first:mt-0">
              <h2 className="mb-3 text-[13px] font-medium uppercase tracking-wider text-muted">
                截图
              </h2>
              <ScreenshotGallery shots={shots} />
            </section>
          ) : null}

          {readme ? (
            <section className="mt-10 first:mt-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-[13px] font-medium uppercase tracking-wider text-muted">
                  项目 README
                </h2>
                {item.repoUrl ? (
                  <a
                    href={item.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] text-muted transition hover:text-accent"
                  >
                    在 GitHub 打开 ↗
                  </a>
                ) : null}
              </div>

              <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
                <div className="flex items-center gap-2 border-b border-line bg-surface-soft/60 px-4 py-2">
                  <span className="size-[7px] rounded-full bg-[#ff5f57]" />
                  <span className="size-[7px] rounded-full bg-[#febc2e]" />
                  <span className="size-[7px] rounded-full bg-[#28c840]" />
                  <span className="ml-2 font-mono text-[11.5px] text-muted">README.md</span>
                  <span className="ml-auto text-[11px] text-muted">内容较长，可在框内滚动</span>
                </div>
                <div className="relative">
                  <div className="readme-scroll h-[440px] overflow-y-auto overscroll-contain px-5 py-4 md:h-[560px] md:px-6">
                    <ReadmeView markdown={readme} fullName={fullName} />
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface to-transparent" />
                </div>
              </div>
            </section>
          ) : item.coverUrl ? (
            <section className="mt-8 overflow-hidden rounded-[14px] border border-line bg-surface-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.coverUrl}
                alt={`${item.name} 预览图`}
                loading="lazy"
                className="max-h-[320px] w-full object-cover object-top"
              />
            </section>
          ) : null}

          {features.length ? (
            <section className="mt-10">
              <h2 className="mb-3 text-[13px] font-medium uppercase tracking-wider text-muted">
                核心功能
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {features.map((feature, index) => (
                  <li
                    key={`${feature.text}-${index}`}
                    className="flex items-start gap-2 rounded-[10px] border border-line bg-surface px-3 py-2.5 text-[13px] leading-relaxed text-ink-soft"
                  >
                    <Check size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                    {feature.text}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {item.body?.root ? (
            <section className="mt-10">
              <h2 className="mb-3 text-[13px] font-medium uppercase tracking-wider text-muted">
                详细介绍
              </h2>
              <div className="prose-macos">
                <RichText data={item.body} />
              </div>
            </section>
          ) : null}

          {item.audience ? (
            <section className="mt-10 rounded-[14px] border border-line bg-surface p-4">
              <h2 className="text-[12px] font-medium uppercase tracking-wider text-muted">
                适合人群
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{item.audience}</p>
            </section>
          ) : null}

          <p className="mt-10 text-[11.5px] leading-relaxed text-muted">
            内容由编辑整理，部分信息来自 GitHub 与项目官网，版权归原作者所有。发现错误？
            <Link href="/dmca" className="ml-1 text-accent">
              报告问题
            </Link>
          </p>
        </div>

        <aside className="space-y-3">
          <div className="rounded-[14px] border border-line bg-surface p-4">
            <h2 className="text-[12px] font-medium uppercase tracking-wider text-muted">信息</h2>
            <dl className="mt-3 space-y-2.5 text-[13px]">
              <Row label="分类" value={category?.name || '未分类'} />
              <Row label="类型" value={labelOf(KINDS, item.kind)} />
              <Row label="平台" value={platforms.map((p) => p.toUpperCase()).join(' / ') || '—'} />
              <Row label="协议" value={item.license || '—'} />
              <Row label="最新版本" value={item.latestRelease || '—'} />
              <Row label="收录时间" value={formatDate(item.publishedAt || item.createdAt)} />
              {item.homepage ? (
                <Row
                  label="官网"
                  value={
                    <a href={item.homepage} target="_blank" rel="noreferrer" className="text-accent">
                      打开 ↗
                    </a>
                  }
                />
              ) : null}
            </dl>
          </div>

          {tags.length ? (
            <div className="rounded-[14px] border border-line bg-surface p-4">
              <h2 className="text-[12px] font-medium uppercase tracking-wider text-muted">标签</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-line bg-surface-soft px-2 py-0.5 text-[11.5px] text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {related.length ? (
            <div>
              <h2 className="mb-2 px-1 text-[12px] font-medium uppercase tracking-wider text-muted">
                相似推荐
              </h2>
              <div className="space-y-2">
                {related.map((entry: any) => (
                  <ItemCard key={entry.id} item={entry} />
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[10px] border border-line bg-surface-soft/60 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-muted">
        {icon}
        {label}
      </div>
      <div className="mt-1 truncate text-[14px] font-medium tabular-nums text-ink">{value}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right text-ink-soft">{value}</dd>
    </div>
  )
}
