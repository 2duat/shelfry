import type { Metadata } from 'next'

import { CommandPalette } from '@/components/command-palette'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ThemeScript } from '@/components/theme-script'

import { getPublicSettings } from '@/lib/queries'

import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings()
  const siteName = settings?.siteName || 'Shelfry'
  const tagline = settings?.tagline || '精选开源软件与 AI 工具'
  const description =
    settings?.description ||
    '精选 macOS、Windows 开源软件，以及 AI 工具、MCP Server、插件与技能。人工策展 + GitHub 自动同步，每个条目都附安装方式。'

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteName} · ${tagline}`,
      template: `%s · ${siteName}`,
    },
    description,
    keywords: ['开源软件', 'macOS', 'Windows', 'AI 工具', 'MCP', '插件', '效率工具'],
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      siteName,
      title: `${siteName} · ${tagline}`,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteName} · ${tagline}`,
      description,
    },
    alternates: {
      canonical: '/',
      types: { 'application/rss+xml': '/rss.xml' },
    },
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSettings()
  const siteName = settings?.siteName || 'Shelfry'

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <SiteHeader siteName={siteName} githubUrl={settings?.githubUrl || undefined} />
        <main className="min-h-[60vh]">{children}</main>
        <SiteFooter
          siteName={siteName}
          footerNote={settings?.footerNote}
          icp={settings?.icp}
          email={settings?.email}
        />
        <CommandPalette />
      </body>
    </html>
  )
}
