import { Search } from 'lucide-react'
import type { Metadata } from 'next'

import { ItemCard } from '@/components/item-card'
import { listItems } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '搜索',
  description: '在 Shelfry 中搜索开源软件、AI 工具与插件。',
  robots: { index: false },
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const query = typeof sp.q === 'string' ? sp.q.trim().slice(0, 80) : ''
  const result = query ? await listItems({ q: query, limit: 30 }) : { docs: [], totalDocs: 0 }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-8 pt-12 md:px-8">
      <h1 className="text-[30px] font-semibold tracking-[-0.03em]">搜索</h1>

      <form action="/search" method="get" className="mt-5 max-w-2xl">
        <div className="flex h-12 items-center gap-2.5 rounded-[12px] border border-line bg-surface px-3.5 focus-within:border-line-strong">
          <Search size={17} className="text-muted" />
          <input
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="软件名、用途、关键词，例如 截图、MCP、菜单栏"
            className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            className="h-8 rounded-full bg-accent px-3.5 text-[12.5px] font-medium text-accent-ink"
          >
            搜索
          </button>
        </div>
      </form>

      {query ? (
        <p className="mt-5 text-[12.5px] text-muted">
          「{query}」找到 <span className="tabular-nums text-ink-soft">{result.totalDocs}</span> 个结果
        </p>
      ) : (
        <p className="mt-5 text-[12.5px] text-muted">输入关键词开始搜索，按 ⌘K 可随时唤起快捷搜索。</p>
      )}

      {result.docs.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(result.docs as any[]).map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : query ? (
        <div className="mt-8 rounded-[18px] border border-dashed border-line bg-surface/50 px-6 py-14 text-center">
          <p className="text-[14px] text-ink">没有找到匹配的内容</p>
          <p className="mt-2 text-[13px] text-muted">
            试试更短的关键词，或者
            <a href="/submit" className="ml-1 text-accent">
              提交一个项目
            </a>
          </p>
        </div>
      ) : null}
    </div>
  )
}
