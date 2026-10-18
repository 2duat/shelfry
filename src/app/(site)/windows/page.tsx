import type { Metadata } from 'next'

import { ListingView } from '@/components/listing-view'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'Windows 开源软件',
  description: 'Windows 上值得安装的开源工具：系统增强、截图录屏、启动器与开发效率软件。',
  alternates: { canonical: '/windows' },
}

export default async function WindowsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <ListingView
      title="Windows 开源软件"
      subtitle="系统增强、开发工具与效率软件。避开捆绑安装，只留下真正有用的。"
      basePath="/windows"
      fixedPlatform="windows"
      searchParams={await searchParams}
    />
  )
}
