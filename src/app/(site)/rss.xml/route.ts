import { listItems } from '@/lib/queries'

export const dynamic = 'force-dynamic'

const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const result = await listItems({ limit: 30, sort: 'newest' })

  const items = (result.docs as any[])
    .map((item) => {
      const link = `${base}/p/${item.slug}`
      const date = new Date(item.publishedAt || item.createdAt || Date.now()).toUTCString()
      return `
    <item>
      <title>${escapeXml(item.name)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${date}</pubDate>
      <description>${escapeXml(item.tagline || item.summary || '')}</description>
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>OpenShelf · 精选开源软件与 AI 工具</title>
    <link>${base}</link>
    <description>人工策展 + GitHub 自动同步的开源软件目录</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900, s-maxage=900',
    },
  })
}
