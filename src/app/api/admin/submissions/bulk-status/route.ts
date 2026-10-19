import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as qs from 'qs-esm'

import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const ALLOWED = new Set(['pending', 'approved', 'rejected'])

export async function POST(request: NextRequest) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return NextResponse.json({ error: '请先登录后台' }, { status: 401 })
  }

  let body: { ids?: (string | number)[]; query?: string; status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  const status = String(body.status || '')
  if (!ALLOWED.has(status)) {
    return NextResponse.json({ error: '不支持的状态' }, { status: 400 })
  }

  let where: Record<string, any> | undefined
  if (Array.isArray(body.ids) && body.ids.length) {
    where = { id: { in: body.ids.slice(0, 500) } }
  } else if (body.query) {
    const parsed = qs.parse(body.query.replace(/^\?/, ''))
    where = parsed.where as Record<string, any> | undefined
  }

  if (!where) {
    return NextResponse.json({ error: '没有选中投稿' }, { status: 400 })
  }

  const result = await payload.update({
    collection: 'submissions',
    where,
    data: { status: status as 'pending' | 'approved' | 'rejected' },
    limit: 500,
    overrideAccess: true,
  })

  return NextResponse.json({ ok: true, updated: result.docs.length, status })
}
