import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { enrichItem } from '@/lib/enrich-item'
import { getIntegrationConfig } from '@/lib/integrations'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return NextResponse.json({ error: '请先登录后台' }, { status: 401 })
  }

  const { id } = await params
  let item: any
  try {
    item = await payload.findByID({
      collection: 'items',
      id,
      depth: 0,
      overrideAccess: true,
    })
  } catch {
    return NextResponse.json({ error: '条目不存在' }, { status: 404 })
  }

  if (!item?.repoUrl) {
    return NextResponse.json({ error: '这个条目没有 GitHub 地址' }, { status: 400 })
  }

  try {
    const integration = await getIntegrationConfig(payload as any)
    const result = await enrichItem(payload, item, integration)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[admin] enrich item failed', id, String(error))
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '补全失败' },
      { status: 500 },
    )
  }
}
