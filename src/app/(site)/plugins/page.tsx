import type { Metadata } from 'next'

import { ListingView } from '@/components/listing-view'

export const revalidate = 120

export const metadata: Metadata = {
  title: '插件与扩展',
  description: 'VS Code、Obsidian、Chrome、Raycast、Figma 上的开源插件与扩展。',
  alternates: { canonical: '/plugins' },
}

export default async function PluginsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <ListingView
      title="插件与扩展"
      subtitle="寄生在你每天用的软件里，把顺手再往前推一步。"
      basePath="/plugins"
      fixedKinds={['plugin']}
      hideKind
      searchParams={await searchParams}
      emptyHint="插件分类下的条目还不多，试试在后台粘贴一个 GitHub 地址导入。"
    />
  )
}
