'use client'

import { Search } from 'lucide-react'

export function HeroSearch() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('openshelf:search'))}
      className="group flex h-[52px] w-full items-center gap-3 rounded-[14px] border border-line bg-surface/80 pl-4 pr-2.5 text-left shadow-card backdrop-blur-xl transition hover:border-line-strong"
    >
      <Search size={18} className="text-muted" />
      <span className="flex-1 truncate text-[14.5px] text-muted">
        搜索 macOS 软件、AI 工具、插件…
      </span>
      <kbd className="hidden rounded-[7px] border border-line bg-surface-soft px-2 py-1 font-mono text-[11px] text-muted sm:block">
        ⌘K
      </kbd>
    </button>
  )
}
