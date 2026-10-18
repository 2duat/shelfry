import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { normalizeReadme } from '@/lib/readme'

const BADGE_PATTERN =
  /(shields\.io|badgen\.net|badge\.fury\.io|codecov\.io|coveralls\.io|travis-ci\.(org|com)|circleci\.com|api\.codacy\.com|snyk\.io\/test|github\.com\/[^/]+\/[^/]+\/(actions\/)?workflows\/[^/]+\/badge|img\.shields\.io)/i

function stripRelative(value: string): string {
  return value.replace(/^\.\//, '').replace(/^\//, '').replace(/^\.\.\//, '')
}

function resolveImage(src: string | undefined, fullName: string): string | null {
  if (!src) return null
  if (BADGE_PATTERN.test(src)) return null
  if (src.startsWith('data:')) return null
  if (/^https?:\/\//i.test(src) || src.startsWith('//')) return src
  if (src.startsWith('#') || !fullName) return null
  return `https://raw.githubusercontent.com/${fullName}/HEAD/${stripRelative(src)}`
}

function parseImageMeta(title?: string) {
  const raw = String(title || '')
  if (!raw.startsWith('os:')) return null
  const [size, ...flags] = raw.slice(3).split('|')
  const [width, height] = size.split('x')
  const toCss = (value?: string) => {
    if (!value) return undefined
    if (value.endsWith('%')) return value
    return /^\d+$/.test(value) ? `${value}px` : value
  }
  return {
    width: toCss(width),
    height: toCss(height),
    center: flags.includes('center'),
  }
}

function resolveLink(href: string | undefined, fullName: string): string {
  if (!href) return '#'
  if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('#')) {
    return href
  }
  return `https://github.com/${fullName}/blob/HEAD/${stripRelative(href)}`
}

export function ReadmeView({
  markdown,
  fullName,
}: {
  markdown: string
  fullName: string
}) {
  const components: Components = {
    a: ({ href, children }) => (
      <a href={resolveLink(href, fullName)} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    ),
    img: ({ src, alt, title }) => {
      const resolved = resolveImage(typeof src === 'string' ? src : undefined, fullName)
      if (!resolved) return null
      const meta = parseImageMeta(title)
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt={alt || ''}
          loading="lazy"
          referrerPolicy="no-referrer"
          className={meta?.center ? 'readme-img--center' : undefined}
          style={
            meta
              ? { width: meta.width, height: meta.width ? undefined : meta.height }
              : undefined
          }
        />
      )
    },
    h1: ({ children }) => <h2>{children}</h2>,
    h2: ({ children }) => <h3>{children}</h3>,
    h3: ({ children }) => <h4>{children}</h4>,
  }

  return (
    <div className="readme-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {normalizeReadme(markdown)}
      </ReactMarkdown>
    </div>
  )
}
