const CODE_FENCE = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/g

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

/**
 * GitHub README 里大量使用内嵌 HTML（居中 logo、徽章、details）。
 * react-markdown 默认不解析 HTML，会把它当纯文本显示，所以先做一次保守转换：
 * - <img> / <a> 转成 Markdown
 * - <br> 转换行
 * - 其余标签去掉，保留文字
 * 代码块内部不做处理。
 */
function cleanSegment(segment: string): string {
  let output = segment
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, text: string) => `\n# ${text.replace(/<[^>]+>/g, '').trim()}\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, text: string) => `\n## ${text.replace(/<[^>]+>/g, '').trim()}\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, text: string) => `\n### ${text.replace(/<[^>]+>/g, '').trim()}\n`)
    .replace(/<img[^>]*?src=["']([^"']+)["'][^>]*?>/gi, (_, src: string) => `\n![](${decodeEntities(src)})\n`)
    .replace(
      /<a[^>]*?href=["']([^"']+)["'][^>]*?>([\s\S]*?)<\/a>/gi,
      (_, href: string, text: string) =>
        `[${text.replace(/<[^>]+>/g, '').trim()}](${decodeEntities(href)})`,
    )
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(
      /<\/?(?:p|div|center|h[1-6]|details|summary|section|article|table|thead|tbody|tfoot|tr|td|th|ul|ol|li|span|font|sup|sub|picture|source|figure|figcaption)\b[^>]*>/gi,
      '\n',
    )
    .replace(/<[^>]+>/g, '')

  output = output.replace(/\n{3,}/g, '\n\n')
  return output
}

export function normalizeReadme(markdown: string): string {
  if (!markdown) return ''
  const parts = markdown.split(CODE_FENCE)
  return parts
    .map((part, index) => (index % 2 === 1 ? part : cleanSegment(part)))
    .join('')
    .trim()
}
