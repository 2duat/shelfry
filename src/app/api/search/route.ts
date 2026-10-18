import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { listItems } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim().slice(0, 80) || ''
  const limit = Math.min(20, Math.max(1, Number(request.nextUrl.searchParams.get('limit')) || 8))

  if (!query) return NextResponse.json({ items: [] })

  const result = await listItems({ q: query, limit })

  return NextResponse.json({
    items: (result.docs as any[]).map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      tagline: item.tagline,
      iconUrl: item.iconUrl,
      platforms: item.platforms,
      kind: item.kind,
      stars: item.stars,
    })),
  })
}
