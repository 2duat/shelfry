import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const itemWhere = (status: string) => ({
    collection: 'items' as const,
    where: { status: { equals: status } },
    overrideAccess: true,
  })

  const [all, published, draft, hidden, aiComplete, aiPending, submissions, pending, approved, rejected] =
    await Promise.all([
      payload.count({ collection: 'items', overrideAccess: true }),
      payload.count(itemWhere('published')),
      payload.count(itemWhere('draft')),
      payload.count(itemWhere('hidden')),
      payload.count({
        collection: 'items',
        where: { aiEnriched: { equals: true } },
        overrideAccess: true,
      }),
      payload.count({
        collection: 'items',
        where: { aiEnriched: { not_equals: true } },
        overrideAccess: true,
      }),
      payload.count({ collection: 'submissions', overrideAccess: true }),
      payload.count({
        collection: 'submissions',
        where: { status: { equals: 'pending' } },
        overrideAccess: true,
      }),
      payload.count({
        collection: 'submissions',
        where: { status: { equals: 'approved' } },
        overrideAccess: true,
      }),
      payload.count({
        collection: 'submissions',
        where: { status: { equals: 'rejected' } },
        overrideAccess: true,
      }),
    ])

  return NextResponse.json({
    items: {
      all: all.totalDocs,
      published: published.totalDocs,
      draft: draft.totalDocs,
      hidden: hidden.totalDocs,
      aiComplete: aiComplete.totalDocs,
      aiPending: aiPending.totalDocs,
    },
    submissions: {
      all: submissions.totalDocs,
      pending: pending.totalDocs,
      approved: approved.totalDocs,
      rejected: rejected.totalDocs,
    },
  })
}
