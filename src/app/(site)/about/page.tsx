import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '关于',
  description: 'OpenShelf 是一个精选开源软件与 AI 工具的目录站，人工策展 + GitHub 自动同步。',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-8 pt-14 md:px-8">
      <h1 className="text-[32px] font-semibold tracking-[-0.03em] md:text-[40px]">关于 OpenShelf</h1>
      <p className="mt-4 text-[15px] leading-[1.9] text-ink-soft">
        OpenShelf 收集真正值得安装的开源软件：macOS、Windows 上的桌面应用与命令行工具，
        以及这两年最热的 AI 工具、MCP Server、插件与 Agent 技能。
      </p>

      <h2 className="mt-10 text-[18px] font-semibold">收录标准</h2>
      <ul className="mt-3 space-y-2.5 text-[14px] leading-[1.8] text-ink-soft">
        <li>· 仓库公开可访问，有实际代码与说明，不是空壳或纯营销页。</li>
        <li>· 有明确的使用场景，能解决一个具体问题。</li>
        <li>· 优先收录持续维护、有 release、文档完整的项目。</li>
        <li>· 不收录破解、盗版、爬取隐私数据的工具。</li>
      </ul>

      <h2 className="mt-10 text-[18px] font-semibold">内容从哪里来</h2>
      <p className="mt-3 text-[14px] leading-[1.9] text-ink-soft">
        元数据（星标、协议、更新时间）来自 GitHub API；中文介绍、标签与分类由编辑结合 README
        整理，部分使用大模型辅助生成后人工校对。所有截图与图标版权归原项目作者所有。
      </p>

      <h2 className="mt-10 text-[18px] font-semibold">技术栈</h2>
      <p className="mt-3 text-[14px] leading-[1.9] text-ink-soft">
        Next.js 16 + Payload CMS 3 + PostgreSQL，部署在 Ubuntu 宝塔面板。站点代码与采集脚本开源。
      </p>

      <div className="mt-10 rounded-[14px] border border-line bg-surface p-5">
        <div className="text-[14px] font-medium">有项目想推荐？</div>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">
          直接提交 GitHub 地址，或到后台导入。审核通过后会自动补全信息。
        </p>
        <Link
          href="/submit"
          className="mt-4 inline-flex h-9 items-center rounded-full bg-accent px-4 text-[13px] font-medium text-accent-ink"
        >
          提交软件
        </Link>
      </div>
    </div>
  )
}
