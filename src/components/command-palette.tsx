'use client'

import { ArrowRight, Command, CornerDownLeft, Loader2, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { ItemIcon } from '@/components/item-icon'
import { cn, formatCompact } from '@/lib/utils'

type SearchItem = {
  id: string | number
  name: string
  slug: string
  tagline?: string
  iconUrl?: string
  platforms?: string[]
  kind?: string
  stars?: number
}

const QUICK = [
  { href: '/macos', label: 'macOS 开源软件' },
  { href: '/windows', label: 'Windows 开源软件' },
  { href: '/ai', label: 'AI 工具与技能' },
  { href: '/plugins', label: '插件与扩展' },
]

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setItems([])
    setActive(0)
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
      if (event.key === 'Escape') setOpen(false)
    }
    function onOpen() {
      setOpen(true)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('openshelf:search', onOpen)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('openshelf:search', onOpen)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => inputRef.current?.focus(), 50)
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (!q) {
      setItems([])
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('search failed')
        const data = (await res.json()) as { items?: SearchItem[] }
        setItems(data.items || [])
        setActive(0)
      } catch {
        /* 忽略取消与网络错误 */
      } finally {
        setLoading(false)
      }
    }, 160)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, open])

  function go(item: SearchItem) {
    close()
    router.push(`/p/${item.slug}`)
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => Math.min(index + 1, Math.max(items.length - 1, 0)))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => Math.max(index - 1, 0))
    }
    if (event.key === 'Enter' && items[active]) {
      event.preventDefault()
      go(items[active])
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[2px]"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            role="dialog"
            aria-modal="true"
            aria-label="搜索"
            onClick={(event) => event.stopPropagation()}
            className="mx-auto mt-[10vh] w-[min(92vw,640px)] overflow-hidden rounded-[16px] border border-line bg-surface shadow-pop"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={17} className="text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="搜索软件、AI 工具、插件…"
                className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
              />
              {loading ? <Loader2 size={15} className="animate-spin text-muted" /> : null}
              <button
                type="button"
                onClick={close}
                className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted"
              >
                esc
              </button>
            </div>

            <div className="max-h-[54vh] overflow-y-auto p-2">
              {query.trim() && items.length === 0 && !loading ? (
                <div className="px-3 py-10 text-center text-sm text-muted">
                  没有找到「{query}」，换个关键词试试，或
                  <a href="/submit" className="ml-1 text-accent">
                    提交一个
                  </a>
                </div>
              ) : null}

              {!query.trim() ? (
                <div className="p-1">
                  <div className="px-2 pb-2 pt-1 text-[11px] font-medium uppercase tracking-wider text-muted">
                    快速前往
                  </div>
                  {QUICK.map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => {
                        close()
                        router.push(item.href)
                      }}
                      className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[14px] text-ink-soft transition hover:bg-surface-soft"
                    >
                      <ArrowRight size={15} className="text-muted" />
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(item)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition',
                    index === active ? 'bg-accent-soft' : 'hover:bg-surface-soft',
                  )}
                >
                  <ItemIcon src={item.iconUrl} name={item.name} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-ink">
                      {item.name}
                    </span>
                    <span className="block truncate text-[12px] text-muted">
                      {item.tagline || '开源项目'}
                    </span>
                  </span>
                  {item.stars ? (
                    <span className="shrink-0 font-mono text-[11px] text-muted">
                      ★ {formatCompact(item.stars)}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <CornerDownLeft size={12} /> 打开
              </span>
              <span className="flex items-center gap-1">
                <Command size={12} /> K 随时唤起
              </span>
              <span className="ml-auto">↑↓ 选择</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
