import type { Metadata } from 'next'

import { ListingView } from '@/components/listing-view'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'macOS 开源软件',
  description: '为 Mac 挑选的开源应用、菜单栏工具与命令行程序，人工精选并持续更新。',
  alternates: { canonical: '/macos' },
}

export default async function MacosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <ListingView
      title="macOS 开源软件"
      subtitle="菜单栏工具、效率应用与命令行程序。每一个都能在 GitHub 找到源码。"
      basePath="/macos"
      fixedPlatform="macos"
      searchParams={await searchParams}
    />
  )
}
