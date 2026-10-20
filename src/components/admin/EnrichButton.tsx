'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { Loader2, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function EnrichButton() {
  const { id } = useDocumentInfo()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  if (!id) return null

  const run = async () => {
    if (busy) return
    setBusy(true)
    setMessage('')
    try {
      const res = await fetch(`/api/admin/items/${id}/enrich`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '补全失败')

      setMessage(
        data.aiGenerated
          ? `已补全，README ${data.readmeLength} 字`
          : `已抓取 README（${data.readmeLength} 字），AI 暂未成功，稍后会重试`,
      )
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '补全失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="shelfry-enrich-action">
      <button type="button" className="shelfry-admin-action" onClick={() => void run()} disabled={busy}>
        {busy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
        {busy ? '正在补全…' : '立即 AI 补全'}
      </button>
      {message ? (
        <span className="shelfry-admin-message" role="status">
          {message}
        </span>
      ) : null}
    </div>
  )
}
