import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ListingView } from '@/components/listing-view'
import { getCategoryBySlug } from '@/lib/queries'

export const revalidate = 120

type Params = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: '分类未找到' }
  return {
    title: `${category.name} — 开源软件推荐`,
    description: category.description || `${category.name} 分类下的精选开源软件与工具。`,
    alternates: { canonical: `/category/${slug}` },
  }
}

export default async function CategoryPage({ params, searchParams }: Params) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  return (
    <ListingView
      title={category.name}
      subtitle={category.description || undefined}
      basePath={`/category/${slug}`}
      searchParams={await searchParams}
    />
  )
}
