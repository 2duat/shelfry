'use client'

import { Layers3, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import { GithubIcon } from './github-icon'
import { SearchButton } from './search-button'
import { ThemeToggle } from './theme-toggle'

const NAV = [
  { href: '/', label: '发现' },
  { href: '/macos', label: 'macOS' },
  { href: '/windows', label: 'Windows' },
  { href: '/ai', label: 'AI' },
  { href: '/plugins', label: '插件' },
  { href: '/collections', label: '合集' },
]

export function SiteHeader({ githubUrl }: { githubUrl?: string }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-line glass">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-5 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="OpenShelf 首页">
          <span className="grid size-8 place-items-center rounded-[9px] bg-gradient-to-br from-[#3b82f6] to-[#6366f1] text-white shadow-sm">
            <Layers3 size={17} strokeWidth={2.2} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.01em]">OpenShelf</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[13.5px] transition',
                  active
                    ? 'bg-ink/[0.06] font-medium text-ink dark:bg-white/10'
                    : 'text-muted hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchButton />
          <Link
            href={githubUrl || 'https://github.com'}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hidden size-9 place-items-center rounded-full border border-line bg-surface/60 text-muted transition hover:text-ink sm:grid"
          >
            <GithubIcon size={16} />
          </Link>
          <ThemeToggle />
          <button
            type="button"
            aria-label="菜单"
            onClick={() => setMobileOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-full border border-line bg-surface/60 text-muted md:hidden"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-line bg-surface px-5 py-3 md:hidden">
          <div className="grid grid-cols-2 gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-surface-soft"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/submit" className="rounded-lg px-3 py-2 text-sm text-accent">
              提交软件
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}
