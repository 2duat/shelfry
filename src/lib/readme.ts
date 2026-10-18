const CODE_FENCE = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/g

function getAttr(attrs: string, name: string): string | undefined {
  const pattern = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')
  const match = pattern.exec(attrs)
  return match ? match[1] ?? match[2] ?? match[3] : undefined
}

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
    .replace(/<p[^>]*align=["']center["'][^>]*>([\s\S]*?)<\/p>/gi, (_, inner: string) => {
      return `\n\n${inner.replace(/<img\b/gi, '<img data-os-center="1"')}\n\n`
    })
    .replace(/<img\b([^>]*?)\/?>/gi, (_, attrs: string) => {
      const src = getAttr(attrs, 'src')
      if (!src) return ''
      const alt = (getAttr(attrs, 'alt') || '')
        .replace(/[[\]]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      const width = getAttr(attrs, 'width') || ''
      const height = getAttr(attrs, 'height') || ''
      const center = /data-os-center/i.test(attrs)
      const flags = center ? '|center' : ''
      const title =
        width || height
          ? ` "os:${width}x${height}${flags}"`
          : center
            ? ` "os:x${flags}"`
            : ''
      return ` ![${alt}](${decodeEntities(src)}${title}) `
    })
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
