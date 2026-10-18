'use client'

import { ArrowRight, Check, Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'

export function SubmitForm() {
  const [repoUrl, setRepoUrl] = useState('')
  const [note, setNote] = useState('')
  const [contact, setContact] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setState('sending')
    setMessage('')
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, note, contact }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data.error || '提交失败，请稍后再试')
      setState('ok')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : '提交失败')
    }
  }

  if (state === 'ok') {
    return (
      <div className="rounded-[18px] border border-line bg-surface p-8 text-center shadow-card">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
          <Check size={22} />
        </div>
        <h2 className="mt-4 text-[17px] font-semibold">已收到，谢谢！</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          我们会尽快审核。通过后会自动抓取仓库信息并生成中文介绍。
        </p>
        <button
          type="button"
          onClick={() => {
            setState('idle')
            setRepoUrl('')
            setNote('')
            setContact('')
          }}
          className="mt-5 text-[13px] text-accent"
        >
          再提交一个
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[18px] border border-line bg-surface p-6 shadow-card md:p-7"
    >
      <label className="block text-[12.5px] font-medium text-ink-soft">
        GitHub 地址 <span className="text-red-500">*</span>
      </label>
      <input
        required
        value={repoUrl}
        onChange={(event) => setRepoUrl(event.target.value)}
        placeholder="https://github.com/owner/repo"
        className="mt-1.5 h-11 w-full rounded-[10px] border border-line bg-surface-soft px-3 text-[13.5px] outline-none transition focus:border-line-strong"
      />

      <label className="mt-4 block text-[12.5px] font-medium text-ink-soft">推荐理由</label>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={4}
        placeholder="它解决了什么问题？你最喜欢哪一点？"
        className="mt-1.5 w-full resize-y rounded-[10px] border border-line bg-surface-soft px-3 py-2.5 text-[13.5px] leading-relaxed outline-none transition focus:border-line-strong"
      />

      <label className="mt-4 block text-[12.5px] font-medium text-ink-soft">联系方式（可选）</label>
      <input
        value={contact}
        onChange={(event) => setContact(event.target.value)}
        placeholder="邮箱或社交账号，方便我们确认"
        className="mt-1.5 h-11 w-full rounded-[10px] border border-line bg-surface-soft px-3 text-[13.5px] outline-none transition focus:border-line-strong"
      />

      {state === 'error' ? (
        <p className="mt-4 rounded-[10px] bg-red-500/10 px-3 py-2 text-[12.5px] text-red-600 dark:text-red-400">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent text-[13.5px] font-medium text-accent-ink transition hover:opacity-90 disabled:opacity-60"
      >
        {state === 'sending' ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
        {state === 'sending' ? '提交中…' : '提交推荐'}
      </button>

      <p className="mt-3 text-center text-[11.5px] leading-relaxed text-muted">
        提交后进入人工审核，不会立即出现在站内。
      </p>
    </form>
  )
}
