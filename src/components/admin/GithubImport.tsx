'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

type Result = {
  id: string | number
  name: string
  slug: string
  stars?: number
  status?: string
}

export function GithubImport() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existing, setExisting] = useState<{ id: string | number; name: string } | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  async function submit(event?: React.FormEvent) {
    event?.preventDefault()
    if (!url.trim() || loading) return

    setLoading(true)
    setError('')
    setExisting(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: url.trim(), status }),
      })
      const data = (await response.json()) as {
        error?: string
        existing?: { id: string | number; name: string }
        id?: string | number
        name?: string
        slug?: string
        stars?: number
        status?: string
      }

      if (response.status === 409 && data.existing) {
        setExisting(data.existing)
        return
      }
      if (!response.ok) throw new Error(data.error || '导入失败')

      setResult({
        id: data.id as string | number,
        name: data.name || '',
        slug: data.slug || '',
        stars: data.stars,
        status: data.status,
      })
      setUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="os-import">
      <div className="os-import__head">
        <div>
          <div className="os-import__title">一键导入 GitHub 项目</div>
          <div className="os-import__desc">
            粘贴仓库地址，自动抓取星标、协议、README，并生成中文介绍
          </div>
        </div>
        <a className="os-import__link" href="/admin/collections/items/create">
          手动填写 →
        </a>
      </div>

      <form className="os-import__row" onSubmit={submit}>
        <input
          className="os-import__input"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://github.com/owner/repo"
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
        />
        <select
          className="os-import__select"
          value={status}
          onChange={(event) => setStatus(event.target.value as 'draft' | 'published')}
          disabled={loading}
          aria-label="导入后的状态"
        >
          <option value="draft">存为草稿</option>
          <option value="published">直接发布</option>
        </select>
        <button className="os-import__btn" type="submit" disabled={loading || !url.trim()}>
          {loading ? '抓取中…' : '一键导入'}
        </button>
      </form>

      {error ? <div className="os-import__msg os-import__msg--error">{error}</div> : null}

      {existing ? (
        <div className="os-import__msg os-import__msg--warn">
          这个仓库已经在库里了：<strong>{existing.name}</strong>
          <a href={`/admin/collections/items/${existing.id}`}>打开条目 →</a>
        </div>
      ) : null}

      {result ? (
        <div className="os-import__msg os-import__msg--ok">
          已导入 <strong>{result.name}</strong>
          {typeof result.stars === 'number' ? ` · ★ ${result.stars.toLocaleString()}` : ''}
          {result.status === 'published' ? ' · 已发布' : ' · 草稿'}
          <a href={`/admin/collections/items/${result.id}`}>打开编辑 →</a>
          <button type="button" onClick={() => router.refresh()}>
            刷新列表
          </button>
        </div>
      ) : null}
    </div>
  )
}
