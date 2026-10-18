import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { getCollections } from '@/lib/queries'

export const revalidate = 300

export const metadata: Metadata = {
  title: '编辑合集',
  description: '按场景整理的开源软件清单：新 Mac 必装、Windows 效率、AI 工具箱。',
  alternates: { canonical: '/collections' },
}

export default async function CollectionsPage() {
  const lists = await getCollections(30)

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-8 pt-12 md:px-8">
      <h1 className="text-[32px] font-semibold tracking-[-0.03em] md:text-[40px]">编辑合集</h1>
      <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed text-muted">
        不想一个个翻？从这些场景清单开始。每份都由编辑实际使用后整理。
      </p>

      {lists.length ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list: any) => (
            <Link
              key={list.id}
              href={`/collections/${list.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-[18px] border border-line bg-surface transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="relative h-32 overflow-hidden bg-gradient-to-br from-[#6366f1]/20 via-[#3b82f6]/10 to-transparent">
                {list.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={list.cover}
                    alt=""
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid size-full place-items-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted/70">
                    Collection
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-[16px] font-semibold text-ink">{list.title}</h2>
                <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-muted">
                  {list.intro || '一份值得从头看到尾的清单。'}
                </p>
                <div className="mt-4 flex items-center justify-between text-[12px] text-muted">
                  <span>{list.entries?.length || 0} 个条目</span>
                  <ArrowRight
                    size={15}
                    className="transition group-hover:translate-x-0.5 group-hover:text-ink"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[18px] border border-dashed border-line bg-surface/50 px-6 py-16 text-center">
          <p className="text-[14px] text-ink">还没有发布合集</p>
          <p className="mt-2 text-[13px] text-muted">在后台「合集」里创建并发布即可显示在这里。</p>
        </div>
      )}
    </div>
  )
}
