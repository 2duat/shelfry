import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as qs from 'qs-esm'

import { enqueueEnrich } from '@/lib/enrich-queue'
import { getIntegrationConfig } from '@/lib/integrations'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return NextResponse.json({ error: '请先登录后台' }, { status: 401 })
  }
  if ((user as any).role !== 'admin') {
    return NextResponse.json({ error: '只有管理员可以批量补全' }, { status: 403 })
  }

  let body: { ids?: (string | number)[]; query?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  let where: Record<string, any> | undefined
  if (Array.isArray(body.ids) && body.ids.length) {
    where = { id: { in: body.ids.slice(0, 200) } }
  } else if (body.query) {
    const parsed = qs.parse(body.query.replace(/^\?/, ''))
    where = parsed.where as Record<string, any> | undefined
  }

  if (!where) {
    return NextResponse.json({ error: '没有选择项目' }, { status: 400 })
  }

  const result = await payload.find({
    collection: 'items',
    where: { and: [where, { aiEnriched: { not_equals: true } }] },
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  const ids = result.docs.map((item: any) => item.id)
  const integration = await getIntegrationConfig(payload as any)
  const queued = enqueueEnrich(payload, ids, integration)

  return NextResponse.json({
    ok: true,
    queued,
    total: result.totalDocs,
  })
}
