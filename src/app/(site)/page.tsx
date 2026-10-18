import { Apple, ArrowRight, ArrowUpRight, Monitor, Puzzle, Sparkles, Wand2 } from 'lucide-react'
import Link from 'next/link'

import { HeroSearch } from '@/components/hero-search'
import { ItemCard, Stars } from '@/components/item-card'
import { ItemIcon } from '@/components/item-icon'
import { SectionHeading } from '@/components/section-heading'
import { getHomeData, getPublicSettings } from '@/lib/queries'
import { formatDate } from '@/lib/utils'

export const revalidate = 120

const PLATFORM_CARDS = [
  {
    href: '/macos',
    title: 'macOS',
    desc: '菜单栏工具、效率应用与命令行',
    icon: Apple,
    tint: 'from-zinc-500/15 to-zinc-500/5',
  },
  {
    href: '/windows',
    title: 'Windows',
    desc: '系统增强、开发与效率工具',
    icon: Monitor,
    tint: 'from-sky-500/15 to-sky-500/5',
  },
  {
    href: '/ai',
    title: 'AI 工具',
    desc: 'AI 应用、MCP Server 与 Agent 技能',
    icon: Sparkles,
    tint: 'from-violet-500/15 to-violet-500/5',
  },
  {
    href: '/plugins',
    title: '插件与扩展',
    desc: 'VS Code、Obsidian、Chrome、Raycast',
    icon: Puzzle,
    tint: 'from-emerald-500/15 to-emerald-500/5',
  },
]

const QUICK_LINKS = [
  { href: '/macos', label: 'macOS' },
  { href: '/windows', label: 'Windows' },
  { href: '/ai', label: 'AI 工具' },
  { href: '/ai?kind=mcp-server', label: 'MCP Server' },
  { href: '/plugins', label: '插件' },
]

export default async function HomePage() {
  const [data, settings] = await Promise.all([getHomeData(), getPublicSettings()])

  const heroTitle = settings?.heroTitle || '发现真正好用的开源软件'
  const heroSubtitle =
    settings?.heroSubtitle ||
    'macOS、Windows、AI 工具与插件。人工精选 + GitHub 自动同步，每一个都附安装方式与真实评价。'

  const featured = data.featured.length ? data.featured : data.trending.slice(0, 4)
  const featuredIds = new Set(featured.map((item: any) => item.id))
  const picks = data.picks.filter((item: any) => !featuredIds.has(item.id))
  const hasContent = featured.length > 0 || data.latest.length > 0

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-64 h-[520px] bg-[radial-gradient(55%_60%_at_50%_0%,rgba(59,130,246,0.20),transparent_72%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pt-14 md:px-8 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-1 text-[11.5px] text-muted backdrop-blur">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              GitHub 自动同步 · 人工策展
            </span>

            <h1 className="text-balance mt-4 text-[38px] font-semibold leading-[1.06] tracking-[-0.04em] text-ink md:text-[54px]">
              {heroTitle}
            </h1>

            <p className="text-balance mx-auto mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted md:text-[15.5px]">
              {heroSubtitle}
            </p>

            <div className="mx-auto mt-6 max-w-xl">
              <HeroSearch />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-line bg-surface/50 px-2.5 py-1 text-[12px] text-muted transition hover:border-line-strong hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[12.5px] text-muted">
              <span>
                <span className="font-semibold tabular-nums text-ink">{data.stats.items}</span> 个条目
              </span>
              <span className="size-1 rounded-full bg-line-strong" />
              <span>
                <span className="font-semibold tabular-nums text-ink">{data.stats.categories}</span> 个分类
              </span>
              <span className="size-1 rounded-full bg-line-strong" />
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                每日自动同步
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        {/* 平台入口 */}
        <section className="mt-10 md:mt-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-ink md:text-[22px]">
                按平台浏览
              </h2>
              <p className="mt-1 text-[12.5px] text-muted">从你正在用的系统开始</p>
            </div>
            <Link
              href="/search"
              className="group inline-flex shrink-0 items-center gap-1 text-[12.5px] text-muted transition hover:text-accent"
            >
              全部软件
              <ArrowUpRight size={13} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORM_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group flex items-center gap-3 rounded-[14px] border border-line bg-surface px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br ${card.tint} text-ink-soft ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]`}
                  >
                    <Icon size={17} strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-ink">{card.title}</span>
                    <span className="block truncate text-[11.5px] text-muted">{card.desc}</span>
                  </span>
                  <ArrowRight
                    size={14}
                    className="shrink-0 text-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </Link>
              )
            })}
          </div>
        </section>

        {/* 精选 + 榜单 */}
        {featured.length || data.trending.length ? (
          <section className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              {featured.length ? (
                <>
                  <SectionHeading
                    title="精选推荐"
                    subtitle="编辑挑选，值得先试的那几个"
                    href="/search"
                    linkLabel="更多"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {featured.slice(0, 4).map((item: any) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            {data.trending.length ? (
              <div className="min-w-0">
                <SectionHeading title="本周上升" subtitle="按热度与新鲜度综合排序" />
                <div className="overflow-hidden rounded-[16px] border border-line bg-surface">
                  {data.trending.slice(0, 6).map((item: any, index: number) => (
                    <Link
                      key={item.id}
                      href={`/p/${item.slug}`}
                      className="group flex items-center gap-3 border-b border-line px-4 py-3 transition last:border-b-0 hover:bg-surface-soft"
                    >
                      <span className="w-5 shrink-0 font-mono text-[11px] text-muted">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <ItemIcon src={item.iconUrl} name={item.name} size={34} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-ink">
                          {item.name}
                        </span>
                        <span className="block truncate text-[11.5px] text-muted">
                          {item.tagline || '开源项目'}
                        </span>
                      </span>
                      <Stars value={item.stars} />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* 编辑精选 */}
        {picks.length ? (
          <section className="mt-14">
            <SectionHeading
              title="编辑精选"
              subtitle="每一个都亲手试过"
              href="/search"
              linkLabel="查看全部"
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {picks.slice(0, 8).map((item: any) => (
                <ItemCard key={item.id} item={item} />
              ))}
              {picks.length % 3 !== 0 ? (
                <Link
                  href="/search"
                  className="group flex min-h-[164px] flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-line bg-surface/40 p-5 text-center transition hover:border-line-strong hover:bg-surface"
                >
                  <span className="grid size-10 place-items-center rounded-full border border-line bg-surface text-muted transition group-hover:text-accent">
                    <ArrowRight size={16} />
                  </span>
                  <span className="text-[13px] font-medium text-ink">查看全部项目</span>
                  <span className="text-[11.5px] text-muted">共 {data.stats.items} 个</span>
                </Link>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* 最新收录 + 分类/标签 */}
        {data.latest.length ? (
          <section className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <SectionHeading
                title="最新收录"
                subtitle="刚同步进来的项目"
                href="/search"
                linkLabel="全部"
              />
              <div className="grid gap-2.5 sm:grid-cols-2">
                {data.latest.slice(0, 6).map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/p/${item.slug}`}
                    className="group flex items-start gap-3 rounded-[14px] border border-line bg-surface p-3.5 transition hover:border-line-strong hover:shadow-card"
                  >
                    <ItemIcon src={item.iconUrl} name={item.name} size={38} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13.5px] font-medium text-ink">
                          {item.name}
                        </span>
                        <Stars value={item.stars} />
                      </span>
                      <span className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-muted">
                        {item.tagline || item.summary || '开源项目'}
                      </span>
                      <span className="mt-1 block text-[10.5px] text-muted/80">
                        {formatDate(item.publishedAt || item.createdAt)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <SectionHeading title="按分类浏览" subtitle="从使用场景找工具" />
              <div className="rounded-[16px] border border-line bg-surface p-4">
                <div className="grid grid-cols-2 gap-1">
                  {data.categories.slice(0, 10).map((category: any) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="truncate rounded-[8px] px-2.5 py-2 text-[12.5px] text-ink-soft transition hover:bg-surface-soft hover:text-accent"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>

                {data.tags?.length ? (
                  <div className="mt-3 border-t border-line pt-3.5">
                    <div className="mb-2 text-[10.5px] font-medium uppercase tracking-wider text-muted">
                      热门标签
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {data.tags.slice(0, 12).map((tag: any) => (
                        <Link
                          key={tag.id}
                          href={`/search?q=${encodeURIComponent(tag.name)}`}
                          className="rounded-full border border-line bg-surface-soft px-2.5 py-1 text-[11.5px] text-muted transition hover:border-line-strong hover:text-accent"
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {/* 合集 */}
        {data.collections.length ? (
          <section className="mt-14">
            <SectionHeading title="编辑合集" subtitle="按场景整理好的清单" href="/collections" />
            <div className="grid gap-3 md:grid-cols-3">
              {data.collections.map((list: any) => (
                <Link
                  key={list.id}
                  href={`/collections/${list.slug}`}
                  className="group relative overflow-hidden rounded-[16px] border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
                >
                  <div className="text-[10.5px] font-medium uppercase tracking-wider text-muted">
                    Collection
                  </div>
                  <h3 className="mt-1.5 text-[16px] font-semibold text-ink">{list.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted">
                    {list.intro || '一份值得从头看到尾的清单。'}
                  </p>
                  <div className="mt-3 text-[11.5px] text-muted">
                    {list.entries?.length || 0} 个条目
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {!hasContent ? (
          <section className="mt-12 rounded-[18px] border border-dashed border-line bg-surface/50 p-10 text-center">
            <h2 className="text-[18px] font-semibold">还没有内容</h2>
            <p className="mt-2 text-[13.5px] text-muted">
              打开后台导入第一个 GitHub 项目，或运行 <code className="font-mono">npm run seed</code> 写入示例数据。
            </p>
            <Link
              href="/admin"
              className="mt-5 inline-flex h-9 items-center rounded-full bg-accent px-4 text-[13px] font-medium text-accent-ink"
            >
              进入后台
            </Link>
          </section>
        ) : null}

        {/* CTA */}
        <section className="relative mt-14 overflow-hidden rounded-[22px] border border-line bg-surface p-8 text-center md:p-11">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(99,102,241,0.14),transparent_70%)]" />
          <div className="relative">
            <Wand2 size={20} className="mx-auto text-accent" />
            <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.02em] md:text-[26px]">
              有推荐的开源项目？
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted">
              粘贴一个 GitHub 地址，剩下的信息抓取、中文介绍和分类都由系统完成。
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/submit"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-[13.5px] font-medium text-accent-ink transition hover:opacity-90"
              >
                提交软件 <ArrowRight size={15} />
              </Link>
              <Link
                href="/about"
                className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[13.5px] text-ink-soft transition hover:bg-surface-soft"
              >
                了解收录标准
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
