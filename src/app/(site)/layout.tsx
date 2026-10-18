import type { Metadata } from 'next'

import { CommandPalette } from '@/components/command-palette'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ThemeScript } from '@/components/theme-script'

import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'OpenShelf · 精选开源软件与 AI 工具',
    template: '%s · OpenShelf',
  },
  description:
    '精选 macOS、Windows 开源软件，以及 AI 工具、MCP Server、插件与技能。人工策展 + GitHub 自动同步，每个条目都附安装方式。',
  keywords: ['开源软件', 'macOS', 'Windows', 'AI 工具', 'MCP', '插件', '效率工具'],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'OpenShelf',
    title: 'OpenShelf · 精选开源软件与 AI 工具',
    description: '人工策展 + GitHub 自动同步的开源软件目录。',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenShelf · 精选开源软件与 AI 工具',
    description: '人工策展 + GitHub 自动同步的开源软件目录。',
  },
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/rss.xml' },
  },
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <SiteHeader />
        <main className="min-h-[60vh]">{children}</main>
        <SiteFooter />
        <CommandPalette />
      </body>
    </html>
  )
}
