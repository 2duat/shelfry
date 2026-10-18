import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

function startOfDay(offsetDays = 0) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - offsetDays)
  return date
}

const PLATFORMS = ['macos', 'windows', 'linux', 'web', 'ios', 'android'] as const

export async function GET(request: NextRequest) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const today = startOfDay().toISOString()
  const weekStart = startOfDay(6)

  const [total, published, drafts, todayNew, todayUpdated, pending, failed, lastSync] =
    await Promise.all([
      payload.count({ collection: 'items', overrideAccess: true }),
      payload.count({ collection: 'items', where: { status: { equals: 'published' } }, overrideAccess: true }),
      payload.count({ collection: 'items', where: { status: { equals: 'draft' } }, overrideAccess: true }),
      payload.count({
        collection: 'items',
        where: { createdAt: { greater_than_equal: today } },
        overrideAccess: true,
      }),
      payload.count({
        collection: 'items',
        where: { updatedAt: { greater_than_equal: today } },
        overrideAccess: true,
      }),
      payload.count({
        collection: 'submissions',
        where: { status: { equals: 'pending' } },
        overrideAccess: true,
      }),
      payload.count({
        collection: 'sync-runs',
        where: { status: { equals: 'failed' } },
        overrideAccess: true,
      }),
      payload.find({
        collection: 'sync-runs',
        sort: '-createdAt',
        limit: 1,
        depth: 0,
        overrideAccess: true,
      }),
    ])

  const recent = await payload.find({
    collection: 'items',
    where: { createdAt: { greater_than_equal: weekStart.toISOString() } },
    limit: 5000,
    depth: 0,
    select: { createdAt: true },
    overrideAccess: true,
  })

  const series = Array.from({ length: 7 }, (_, index) => {
    const day = startOfDay(6 - index)
    const next = new Date(day)
    next.setDate(day.getDate() + 1)
    const count = (recent.docs as any[]).filter((doc) => {
      const time = new Date(doc.createdAt).getTime()
      return time >= day.getTime() && time < next.getTime()
    }).length
    return {
      label: `${day.getMonth() + 1}/${day.getDate()}`,
      count,
    }
  })

  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  const categoryCounts = await Promise.all(
    (categories.docs as any[]).map(async (category) => ({
      name: category.name,
      count: (
        await payload.count({
          collection: 'items',
          where: { category: { equals: category.id }, status: { equals: 'published' } },
          overrideAccess: true,
        })
      ).totalDocs,
    })),
  )

  const platformCounts = await Promise.all(
    PLATFORMS.map(async (platform) => ({
      platform,
      count: (
        await payload.count({
          collection: 'items',
          where: { platforms: { contains: platform }, status: { equals: 'published' } },
          overrideAccess: true,
        })
      ).totalDocs,
    })),
  )

  const [tagsCount, listsCount, runsCount, mediaCount, usersCount, submissionsCount] =
    await Promise.all([
      payload.count({ collection: 'tags', overrideAccess: true }),
      payload.count({ collection: 'curated-lists', overrideAccess: true }),
      payload.count({ collection: 'sync-runs', overrideAccess: true }),
      payload.count({ collection: 'media', overrideAccess: true }),
      payload.count({ collection: 'users', overrideAccess: true }),
      payload.count({ collection: 'submissions', overrideAccess: true }),
    ])

  const run = lastSync.docs[0] as any

  return NextResponse.json({
    ok: true,
    totals: {
      total: total.totalDocs,
      published: published.totalDocs,
      drafts: drafts.totalDocs,
      todayNew: todayNew.totalDocs,
      todayUpdated: todayUpdated.totalDocs,
      pendingSubmissions: pending.totalDocs,
      failedSync: failed.totalDocs,
    },
    counts: {
      categories: categories.docs.length,
      tags: tagsCount.totalDocs,
      lists: listsCount.totalDocs,
      syncRuns: runsCount.totalDocs,
      media: mediaCount.totalDocs,
      users: usersCount.totalDocs,
      submissions: submissionsCount.totalDocs,
    },
    series,
    categories: categoryCounts
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    platforms: platformCounts,
    lastSync: run
      ? {
          type: run.type,
          status: run.status,
          finishedAt: run.finishedAt || run.startedAt || run.createdAt,
          stats: run.stats || null,
        }
      : null,
  })
}
