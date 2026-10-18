import type { Metadata } from 'next'

import { ListingView } from '@/components/listing-view'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'AI 工具与技能',
  description: 'AI 应用、MCP Server、Agent 技能与提示词，持续同步 GitHub 上的新项目。',
  alternates: { canonical: '/ai' },
}

export default async function AiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <ListingView
      title="AI 工具与技能"
      subtitle="本地模型、AI 应用、MCP Server、Agent 技能与工作流。按你需要的环节挑选。"
      basePath="/ai"
      fixedKinds={['ai-tool', 'ai-skill', 'mcp-server', 'prompt', 'workflow']}
      hideKind
      searchParams={await searchParams}
      emptyHint="AI 分类下的条目还不多，试试在后台粘贴一个 GitHub 地址导入。"
    />
  )
}
