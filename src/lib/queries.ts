import { getPayloadClient } from './payload'

export type ListParams = {
  platform?: string
  kind?: string | string[]
  host?: string
  categorySlug?: string
  q?: string
  tag?: string
  pricing?: string
  minStars?: number
  sort?: string
  page?: number
  limit?: number
}

const SORT_MAP: Record<string, string> = {
  recommended: '-score',
  newest: '-publishedAt',
  stars: '-stars',
  updated: '-lastCommitAt',
}

function buildWhere(params: ListParams, categoryId?: string | number) {
  const where: Record<string, any> = { status: { equals: 'published' } }

  if (params.platform) where.platforms = { contains: params.platform }
  if (params.kind) {
    where.kind = Array.isArray(params.kind) ? { in: params.kind } : { equals: params.kind }
  }
  if (params.host) where.host = { equals: params.host }
  if (categoryId) where.category = { equals: categoryId }
  if (params.pricing) where.pricing = { equals: params.pricing }
  if (params.minStars) where.stars = { greater_than_equal: params.minStars }
  if (params.tag) where.tagsText = { like: params.tag }

  if (params.q) {
    where.or = [
      { name: { like: params.q } },
      { tagline: { like: params.q } },
      { searchText: { like: params.q } },
      { tagsText: { like: params.q } },
      { githubFullName: { like: params.q } },
    ]
  }

  return where
}

export async function listItems(params: ListParams = {}) {
  try {
    const payload = await getPayloadClient()
    let categoryId: string | number | undefined

    if (params.categorySlug) {
      const category = await getCategoryBySlug(params.categorySlug)
      if (!category) return emptyPage()
      categoryId = category.id
    }

    const result = await payload.find({
      collection: 'items',
      where: buildWhere(params, categoryId),
      sort: SORT_MAP[params.sort || 'recommended'] ?? SORT_MAP.recommended,
      page: Math.max(1, params.page || 1),
      limit: params.limit || 24,
      depth: 1,
    })

    return result as any
  } catch (error) {
    console.error('[queries] listItems failed', error)
    return emptyPage()
  }
}

function emptyPage() {
  return { docs: [], totalDocs: 0, totalPages: 0, page: 1, hasNextPage: false, hasPrevPage: false }
}

export async function getItemBySlug(slug: string) {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'items',
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      limit: 1,
      depth: 2,
    })
    return (result.docs[0] as any) || null
  } catch (error) {
    console.error('[queries] getItemBySlug failed', error)
    return null
  }
}

export async function getRelatedItems(item: any, limit = 3) {
  try {
    const payload = await getPayloadClient()
    const categoryId = typeof item.category === 'object' ? item.category?.id : item.category
    const where: Record<string, any> = {
      status: { equals: 'published' },
      id: { not_equals: item.id },
    }
    if (categoryId) where.category = { equals: categoryId }

    let result = await payload.find({ collection: 'items', where, limit, depth: 1, sort: '-score' })
    if (result.docs.length === 0) {
      result = await payload.find({
        collection: 'items',
        where: { status: { equals: 'published' }, id: { not_equals: item.id } },
        limit,
        depth: 1,
        sort: '-score',
      })
    }
    return result.docs as any[]
  } catch {
    return []
  }
}

export async function getCategories() {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'categories',
      limit: 100,
      sort: 'sort',
      depth: 0,
    })
    return result.docs as any[]
  } catch {
    return []
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    return (result.docs[0] as any) || null
  } catch {
    return null
  }
}

export async function getCollections(limit = 6) {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'curated-lists',
      where: { status: { equals: 'published' } },
      sort: 'sort',
      limit,
      depth: 1,
    })
    return result.docs as any[]
  } catch {
    return []
  }
}

export async function getCollectionBySlug(slug: string) {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'curated-lists',
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      limit: 1,
      depth: 2,
    })
    return (result.docs[0] as any) || null
  } catch {
    return null
  }
}

export async function getHomeData() {
  const payload = await getPayloadClient().catch(() => null)
  if (!payload) {
    return {
      hero: null,
      featured: [],
      picks: [],
      trending: [],
      latest: [],
      categories: [],
      collections: [],
      stats: { items: 0, stars: 0, categories: 0 },
    }
  }

  try {
    const [featured, picks, trending, latest, categories, collections, totalItems, totalStars] =
      await Promise.all([
        payload.find({
          collection: 'items',
          where: { status: { equals: 'published' }, featured: { equals: true } },
          sort: '-score',
          limit: 6,
          depth: 1,
        }),
        payload.find({
          collection: 'items',
          where: { status: { equals: 'published' }, editorsPick: { equals: true } },
          sort: '-publishedAt',
          limit: 6,
          depth: 1,
        }),
        payload.find({
          collection: 'items',
          where: { status: { equals: 'published' } },
          sort: '-score',
          limit: 8,
          depth: 1,
        }),
        payload.find({
          collection: 'items',
          where: { status: { equals: 'published' } },
          sort: '-publishedAt',
          limit: 6,
          depth: 1,
        }),
        payload.find({ collection: 'categories', limit: 12, sort: 'sort', depth: 0 }),
        payload.find({
          collection: 'curated-lists',
          where: { status: { equals: 'published' } },
          sort: 'sort',
          limit: 3,
          depth: 1,
        }),
        payload.count({ collection: 'items', where: { status: { equals: 'published' } } }),
        payload.find({ collection: 'items', where: { status: { equals: 'published' } }, limit: 0 }),
      ])

    return {
      hero: null,
      featured: featured.docs as any[],
      picks: picks.docs.length ? (picks.docs as any[]) : (trending.docs as any[]),
      trending: trending.docs as any[],
      latest: latest.docs as any[],
      categories: categories.docs as any[],
      collections: collections.docs as any[],
      stats: {
        items: totalItems.totalDocs,
        stars: totalStars.docs?.length || totalItems.totalDocs,
        categories: categories.docs.length,
      },
    }
  } catch (error) {
    console.error('[queries] getHomeData failed', error)
    return {
      hero: null,
      featured: [],
      picks: [],
      trending: [],
      latest: [],
      categories: [],
      collections: [],
      stats: { items: 0, stars: 0, categories: 0 },
    }
  }
}

export async function getPublicSettings() {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({
      slug: 'settings',
      depth: 0,
      overrideAccess: false,
    })
    return settings as any
  } catch {
    return {} as any
  }
}

export async function getAllItemSlugs() {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'items',
      where: { status: { equals: 'published' } },
      limit: 2000,
      depth: 0,
      select: { slug: true },
    })
    return (result.docs as any[]).map((doc) => doc.slug).filter(Boolean) as string[]
  } catch {
    return []
  }
}
