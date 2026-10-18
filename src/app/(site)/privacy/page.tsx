import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '隐私说明',
  description: 'OpenShelf 收集哪些数据、如何使用。',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-8 pt-14 md:px-8">
      <h1 className="text-[32px] font-semibold tracking-[-0.03em] md:text-[40px]">隐私说明</h1>

      <div className="mt-6 space-y-6 text-[14px] leading-[1.9] text-ink-soft">
        <section>
          <h2 className="text-[17px] font-semibold text-ink">我们收集什么</h2>
          <p className="mt-2">
            浏览本站不需要注册。我们不使用第三方广告或跨站追踪脚本。仅在以下情况产生数据：
          </p>
          <ul className="mt-2 space-y-1.5">
            <li>· 主题偏好：保存在浏览器 localStorage，不会上传。</li>
            <li>· 投稿：你主动填写的 GitHub 地址、推荐理由与联系方式。</li>
            <li>· 服务端日志：IP、时间与请求路径，用于排查故障，通常保留 7 天。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold text-ink">第三方</h2>
          <p className="mt-2">
            图标与封面图可能直接引用 GitHub 的资源地址；点击外链会跳转到对应项目官网或仓库，
            对方的隐私政策由其自行负责。
          </p>
        </section>

        <section>
          <h2 className="text-[17px] font-semibold text-ink">联系</h2>
          <p className="mt-2">如需删除投稿或咨询数据问题，请通过「版权与下架」页面的邮箱联系。</p>
        </section>
      </div>
    </div>
  )
}
