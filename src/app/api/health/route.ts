import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    const [items, drafts, submissions] = await Promise.all([
      payload.count({ collection: 'items', where: { status: { equals: 'published' } } }),
      payload.count({ collection: 'items', where: { status: { equals: 'draft' } } }),
      payload.count({ collection: 'submissions', where: { status: { equals: 'pending' } } }),
    ])

    return NextResponse.json({
      ok: true,
      time: new Date().toISOString(),
      published: items.totalDocs,
      drafts: drafts.totalDocs,
      pendingSubmissions: submissions.totalDocs,
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
