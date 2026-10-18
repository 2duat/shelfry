import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '版权与下架',
  description: '内容来源说明、版权归属与下架申请方式。',
  alternates: { canonical: '/dmca' },
}

export default function DmcaPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-8 pt-14 md:px-8">
      <h1 className="text-[32px] font-semibold tracking-[-0.03em] md:text-[40px]">版权与下架</h1>

      <div className="mt-6 space-y-6 text-[14px] leading-[1.9] text-ink-soft">
        <section>
          <h2 className="text-[17px] font-semibold text-ink">内容来源</h2>
          <p className="mt-2">
            本站条目的名称、描述、星标与协议信息来自 GitHub 公开 API 与项目 README；
            中文介绍由编辑改写整理。图标、截图与商标归各自作者所有，本站仅作展示与指向。
          </p>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold text-ink">我们不做什么</h2>
          <ul className="mt-2 space-y-1.5">
            <li>· 不镜像、不转售项目源码。</li>
            <li>· 不整篇搬运 README，只保留改写后的摘要。</li>
            <li>· 不声称与项目作者存在合作或背书关系。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold text-ink">申请下架</h2>
          <p className="mt-2">
            如果你是项目作者或权利方，希望删除某个条目或图片，请发送邮件到
            <a href="mailto:takedown@example.com" className="mx-1 text-accent">
              takedown@example.com
            </a>
            ，附上条目链接与身份说明，我们会在 48 小时内处理。
          </p>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold text-ink">内容纠错</h2>
          <p className="mt-2">
            发现描述过时、链接失效或分类错误，也欢迎通过同一邮箱告知，我们会尽快修正。
          </p>
        </section>
      </div>
    </div>
  )
}
