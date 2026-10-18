import type { Metadata } from 'next'

import { SubmitForm } from '@/components/submit-form'

export const metadata: Metadata = {
  title: '提交软件',
  description: '推荐一个值得收录的开源项目，审核通过后会出现在站点里。',
  alternates: { canonical: '/submit' },
}

const STEPS = [
  { title: '粘贴链接', desc: '填 GitHub 仓库地址即可，其余信息我们抓取。' },
  { title: '人工审核', desc: '确认不是广告、仓库可访问、确实好用。' },
  { title: '自动补全', desc: '抓取 README、星标与官网，生成中文介绍。' },
]

export default function SubmitPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-8 pt-12 md:px-8">
      <div className="grid gap-10 md:grid-cols-[1fr_380px] md:gap-14">
        <div>
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] md:text-[40px]">提交软件</h1>
          <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-muted">
            发现了值得推荐的开源项目？把 GitHub 地址丢过来。通过审核后，系统会自动抓取信息并生成介绍。
          </p>

          <ol className="mt-8 space-y-5">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3.5">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-[11px] text-muted">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-[14px] font-medium text-ink">{step.title}</span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">
                    {step.desc}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-8 rounded-[12px] border border-line bg-surface-soft/60 p-4 text-[12.5px] leading-relaxed text-muted">
            只收录能公开访问、有实际内容的仓库。营销页、纯教程、空仓库不会通过。
          </div>
        </div>

        <SubmitForm />
      </div>
    </div>
  )
}
