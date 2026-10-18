import { inferKind, inferPlatforms, guessPricing, type RepoInfo } from './github'

export type Enrichment = {
  tagline: string
  summary: string
  features: string[]
  audience: string
  installHint: string
  categoryHint: string
  tags: string[]
  kind: string
  platforms: string[]
  pricing: string
  aiGenerated: boolean
}

function stripMarkdown(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/[*_`>]/g, '')
    .replace(/\r/g, '')
}

function extractParagraphs(readme: string): string[] {
  const text = stripMarkdown(readme)
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 40 && !/^(badge|shields|license|contributors)/i.test(p))
}

const NOISE =
  /discord|twitter|reddit|telegram|slack|contribut|license|sponsor|star us|give a star|fork|badge|shields\.io|changelog|acknowledg/i

function extractBullets(readme: string): string[] {
  const lines = readme.split('\n')
  const sectionBullets: string[] = []
  const fallbackBullets: string[] = []
  let collecting = false

  for (const line of lines) {
    const heading = line.match(/^#{1,4}\s+(.*)$/)
    if (heading) {
      collecting = /feature|highlight|why (use|choose)|what|capabilit|功能|特性|亮点|优势/i.test(
        heading[1],
      )
      continue
    }

    const bullet = line.match(/^\s*[-*+]\s+(.{6,180})$/)
    if (!bullet) continue

    const raw = bullet[1]
    if (/^\[!\[/.test(raw)) continue

    const text = stripMarkdown(raw).replace(/\s+/g, ' ').trim()
    if (text.length < 8 || text.length > 90) continue
    if (NOISE.test(text)) continue
    if (/^[\w\s]+:?$/.test(text)) continue

    if (collecting) {
      sectionBullets.push(text)
      if (sectionBullets.length >= 6) break
    } else if (fallbackBullets.length < 6) {
      fallbackBullets.push(text)
    }
  }

  return sectionBullets.length >= 3 ? sectionBullets : fallbackBullets
}

function extractInstallCommand(readme: string): string {
  const blocks = [...readme.matchAll(/```(?:bash|sh|shell|zsh|console)?\n([\s\S]*?)```/g)]
  for (const block of blocks) {
    const body = block[1]
    const line = body
      .split('\n')
      .map((l) => l.trim())
      .find((l) =>
        /^(brew install|npm i(nstall)? -g|pnpm add -g|yarn global add|winget install|scoop install|pip install|pipx install|cargo install|go install|curl .*\| *sh)/.test(
          l,
        ),
      )
    if (line) return line.replace(/^\$\s*/, '')
  }
  return ''
}

export function heuristicEnrich(info: RepoInfo): Enrichment {
  const paragraphs = extractParagraphs(info.readme)
  const summarySource = paragraphs[0] || info.description || `${info.name} 是一个开源项目。`
  const summary = summarySource.slice(0, 220)
  const tagline = (info.description || summarySource).slice(0, 90)

  return {
    tagline,
    summary,
    features: extractBullets(info.readme),
    audience: '',
    installHint: extractInstallCommand(info.readme),
    categoryHint: '',
    tags: info.topics.slice(0, 5),
    kind: inferKind(info),
    platforms: inferPlatforms(info),
    pricing: guessPricing(info),
    aiGenerated: false,
  }
}

const SYSTEM_PROMPT = `你是一个中文软件目录站的资深编辑。你会收到一个 GitHub 仓库的元数据与 README。
请输出严格 JSON（不要 markdown 代码块），字段如下：
{
  "tagline": "一句话介绍，不超过 40 个汉字，突出它解决什么问题",
  "summary": "150-220 字的中文介绍，说明它是什么、能做什么、有什么特点；不要照抄 README，不要用营销腔",
  "features": ["3-6 条核心功能，每条不超过 28 字"],
  "audience": "适合什么人用，一句话",
  "installHint": "最常见的安装命令（如果 README 里有），没有就留空字符串",
  "categoryHint": "从这些里选一个最贴切的：效率工具、开发工具、AI 与智能、系统增强、设计创意、媒体影音、笔记知识、网络工具、安全隐私、终端工具",
  "tags": ["3-5 个中文标签"],
  "kind": "app | cli | plugin | ai-tool | ai-skill | mcp-server | prompt | workflow 之一",
  "platforms": ["macos","windows","linux","web","ios","android" 的子集，不确定就留空数组],
  "pricing": "open-source | free | freemium | paid 之一"
}
只输出 JSON。`

export async function enrichWithAI(info: RepoInfo): Promise<Enrichment> {
  const baseUrl = process.env.LLM_BASE_URL
  const apiKey = process.env.LLM_API_KEY
  const model = process.env.LLM_MODEL || 'deepseek-chat'

  if (!baseUrl || !apiKey) return heuristicEnrich(info)

  const userContent = [
    `仓库：${info.fullName}`,
    `描述：${info.description || '（无）'}`,
    `语言：${info.language || '（未知）'}`,
    `Topics：${info.topics.join(', ') || '（无）'}`,
    `License：${info.license || '（无）'}`,
    `Stars：${info.stars}`,
    `README（截断）：\n${stripMarkdown(info.readme).slice(0, 6000)}`,
  ].join('\n')

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      }),
      cache: 'no-store',
    })

    if (!res.ok) return heuristicEnrich(info)

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const raw = data.choices?.[0]?.message?.content
    if (!raw) return heuristicEnrich(info)

    const parsed = JSON.parse(raw) as Partial<Enrichment>
    const fallback = heuristicEnrich(info)

    return {
      tagline: parsed.tagline?.slice(0, 90) || fallback.tagline,
      summary: parsed.summary?.slice(0, 400) || fallback.summary,
      features: Array.isArray(parsed.features) ? parsed.features.slice(0, 6) : fallback.features,
      audience: parsed.audience || '',
      installHint: parsed.installHint || fallback.installHint,
      categoryHint: parsed.categoryHint || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : fallback.tags,
      kind: parsed.kind || fallback.kind,
      platforms: Array.isArray(parsed.platforms) ? parsed.platforms : fallback.platforms,
      pricing: parsed.pricing || fallback.pricing,
      aiGenerated: true,
    }
  } catch {
    return heuristicEnrich(info)
  }
}
