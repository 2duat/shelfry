'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[site] render error', error)
  }, [error])

  return (
    <div className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-5 py-20 text-center">
      <div>
        <div className="font-mono text-[12px] uppercase tracking-[0.3em] text-muted">500</div>
        <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] md:text-[38px]">
          页面暂时没有加载出来
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-muted">
          可能是数据库或 GitHub 接口短暂不可用，稍后重试通常就能恢复。
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-[13.5px] font-medium text-accent-ink"
          >
            重新加载
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[13.5px] text-ink-soft"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
