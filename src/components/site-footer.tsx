import Link from 'next/link'

export function SiteFooter({
  siteName = 'Shelfry',
  footerNote,
  icp,
  email,
}: {
  siteName?: string
  footerNote?: string | null
  icp?: string | null
  email?: string | null
}) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8">
        <div>
          <div className="text-[15px] font-semibold">{siteName}</div>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted">
            {footerNote || '精选开源软件与 AI 工具。信息来自 GitHub 与项目官网，版权归原作者所有。'}
          </p>
          {email ? (
            <a
              href={`mailto:${email}`}
              className="mt-3 inline-block text-[12.5px] text-muted transition hover:text-accent"
            >
              {email}
            </a>
          ) : null}
        </div>

        <FooterColumn
          title="浏览"
          links={[
            { href: '/macos', label: 'macOS' },
            { href: '/windows', label: 'Windows' },
            { href: '/ai', label: 'AI 工具' },
            { href: '/plugins', label: '插件' },
          ]}
        />
        <FooterColumn
          title="内容"
          links={[
            { href: '/collections', label: '编辑合集' },
            { href: '/submit', label: '提交软件' },
            { href: '/rss.xml', label: 'RSS 订阅' },
          ]}
        />
        <FooterColumn
          title="关于"
          links={[
            { href: '/about', label: '关于本站' },
            { href: '/privacy', label: '隐私说明' },
            { href: '/dmca', label: '版权与下架' },
          ]}
        />
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-6 text-[12px] text-muted md:flex-row md:items-center md:justify-between md:px-8">
          <span>
            © {year} {siteName} · 用 Next.js 与 Payload 构建
          </span>
          <span className="inline-flex items-center gap-3">
            {icp ? (
              <a
                href="https://beian.miit.gov.cn"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-ink"
              >
                {icp}
              </a>
            ) : null}
            <span>所有商标与截图归各自所有者</span>
          </span>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: Array<{ href: string; label: string }>
}) {
  return (
    <div>
      <div className="text-[12px] font-medium uppercase tracking-wider text-muted">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-[13px] text-ink-soft transition hover:text-accent">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
