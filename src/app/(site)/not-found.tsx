import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-5 py-20 text-center">
      <div>
        <div className="font-mono text-[12px] uppercase tracking-[0.3em] text-muted">404</div>
        <h1 className="mt-4 text-[32px] font-semibold tracking-[-0.03em] md:text-[40px]">
          这个页面不存在
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-muted">
          链接可能已经失效，或者条目被下架了。回到首页看看别的好东西。
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-[13.5px] font-medium text-accent-ink"
          >
            返回首页
          </Link>
          <Link
            href="/search"
            className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[13.5px] text-ink-soft"
          >
            搜索
          </Link>
        </div>
      </div>
    </div>
  )
}
