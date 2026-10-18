import type { Metadata } from 'next'

import { ListingView } from '@/components/listing-view'

export const revalidate = 120

export const metadata: Metadata = {
  title: '全部项目',
  description: '浏览 Shelfry 收录的全部开源软件、AI 工具、MCP Server 与插件，支持按平台、类型和定价筛选。',
  alternates: { canonical: '/projects' },
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <ListingView
      title="全部项目"
      subtitle="按平台、类型、定价筛选，找到适合你的开源工具。"
      basePath="/projects"
      searchParams={await searchParams}
    />
  )
}
