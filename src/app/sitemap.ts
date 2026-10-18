import type { MetadataRoute } from 'next'

import { getAllItemSlugs, getCategories, getCollections } from '@/lib/queries'

const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, categories, collections] = await Promise.all([
    getAllItemSlugs(),
    getCategories(),
    getCollections(100),
  ])

  const staticRoutes = ['', '/macos', '/windows', '/ai', '/plugins', '/collections', '/submit', '/about'].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: path === '' ? 1 : 0.8,
    }),
  )

  return [
    ...staticRoutes,
    ...slugs.map((slug) => ({
      url: `${base}/p/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...categories.map((category: any) => ({
      url: `${base}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...collections.map((list: any) => ({
      url: `${base}/collections/${list.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
