'use client'

import { Search } from 'lucide-react'

export function SearchButton({ compact = false }: { compact?: boolean }) {
  function open() {
    window.dispatchEvent(new CustomEvent('shelfry:search'))
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={open}
        aria-label="搜索"
        className="grid size-9 place-items-center rounded-full border border-line bg-surface/60 text-muted transition hover:text-ink"
      >
        <Search size={16} />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={open}
      className="group flex h-9 items-center gap-2 rounded-full border border-line bg-surface/60 pl-3 pr-2 text-sm text-muted transition hover:border-line-strong hover:bg-surface"
    >
      <Search size={15} className="text-muted" />
      <span className="hidden sm:inline">搜索软件、工具、技能</span>
      <kbd className="ml-1 hidden rounded-md border border-line bg-surface-soft px-1.5 py-0.5 font-mono text-[11px] text-muted sm:inline">
        ⌘K
      </kbd>
    </button>
  )
}
