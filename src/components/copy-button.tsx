'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export function CopyButton({
  value,
  label = '复制',
  className = '',
}: {
  value: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* 忽略剪贴板权限错误 */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 text-[12px] text-muted transition hover:text-ink ${className}`}
      aria-label={label}
    >
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
      {copied ? '已复制' : label}
    </button>
  )
}
