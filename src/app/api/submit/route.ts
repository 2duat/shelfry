import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { parseRepoUrl } from '@/lib/github'
import { getPayloadClient } from '@/lib/payload'

const WINDOW_MS = 60 * 60 * 1000
const LIMIT = 8
const hits = new Map<string, { count: number; startedAt: number }>()

function rateLimited(key: string): boolean {
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || now - entry.startedAt > WINDOW_MS) {
    hits.set(key, { count: 1, startedAt: now })
    return false
  }
  entry.count += 1
  return entry.count > LIMIT
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'local'

  if (rateLimited(ip)) {
    return NextResponse.json({ error: '提交太频繁了，请一小时后再试' }, { status: 429 })
  }

  let body: { repoUrl?: string; note?: string; contact?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  const repoUrl = String(body.repoUrl || '').trim()
  if (!parseRepoUrl(repoUrl)) {
    return NextResponse.json(
      { error: '请填写有效的 GitHub 仓库地址，例如 https://github.com/owner/repo' },
      { status: 400 },
    )
  }

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'submissions',
      overrideAccess: true,
      data: {
        repoUrl,
        note: String(body.note || '').slice(0, 2000),
        contact: String(body.contact || '').slice(0, 200),
        status: 'pending',
      },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[submit] failed', error)
    return NextResponse.json({ error: '服务暂时不可用，请稍后再试' }, { status: 500 })
  }
}
