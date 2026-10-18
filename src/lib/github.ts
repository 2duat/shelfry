const API = 'https://api.github.com'

export type RepoInfo = {
  owner: string
  repo: string
  fullName: string
  name: string
  description: string
  homepage: string
  stars: number
  forks: number
  language: string
  topics: string[]
  license: string
  archived: boolean
  lastCommitAt: string | null
  defaultBranch: string
  avatarUrl: string
  coverUrl: string
  readme: string
  latestRelease: string
  htmlUrl: string
}

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'OpenShelf/1.0',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return h
}

export function parseRepoUrl(input: string): { owner: string; repo: string } | null {
  if (!input) return null
  const cleaned = input.trim().replace(/\.git$/i, '').replace(/\/+$/, '')
  const urlMatch = cleaned.match(/github\.com[/:]([^/\s?#]+)\/([^/\s?#]+)/i)
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] }
  const shortMatch = cleaned.match(/^([\w.-]+)\/([\w.-]+)$/)
  if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] }
  return null
}

async function fetchReadme(owner: string, repo: string): Promise<string> {
  const candidates = ['README.md', 'readme.md', 'Readme.md', 'README.MD', 'README.rst', 'README']
  for (const file of candidates) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${file}`, {
        headers: { 'User-Agent': 'OpenShelf/1.0' },
        cache: 'no-store',
      })
      if (res.ok) {
        const text = await res.text()
        return text.slice(0, 300_000)
      }
    } catch {
      // 继续尝试下一个文件名
    }
  }
  return ''
}

async function fetchLatestRelease(owner: string, repo: string): Promise<string> {
  try {
    const res = await fetch(`${API}/repos/${owner}/${repo}/releases/latest`, {
      headers: headers(),
      cache: 'no-store',
    })
    if (!res.ok) return ''
    const data = (await res.json()) as { tag_name?: string; name?: string }
    return data.tag_name || data.name || ''
  } catch {
    return ''
  }
}

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function unescapeJson(value: string): string {
  return value.replace(/\\u0026/g, '&').replace(/\\"/g, '"').replace(/\\n/g, ' ')
}

/**
 * 无 Token 时的后备方案：直接解析仓库页面。
 * 星标/描述/Topics 来自页面内嵌 JSON，足够用于收录展示。
 */
async function fetchRepoFromHtml(owner: string, repo: string): Promise<RepoInfo> {
  const res = await fetch(`https://github.com/${owner}/${repo}`, {
    headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html' },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`GitHub 返回 ${res.status}，请稍后重试或在设置里配置 GITHUB_TOKEN`)
  }

  const html = await res.text()

  const stars = Number(/"stargazerCount":(\d+)/.exec(html)?.[1] || 0)
  const forks = Number(/"forksCount":(\d+)/.exec(html)?.[1] || 0)

  const metaDescription = decodeEntities(
    /<meta name="description" content="([^"]*)"/.exec(html)?.[1] || '',
  )
  const description = unescapeJson(metaDescription.replace(/\.?\s*Contribute to .*$/i, '')).trim()

  const topicsBlock = /"topics":\[(.*?)\]/s.exec(html)?.[1] || ''
  const topics = [...topicsBlock.matchAll(/"name":"([^"]+)"/g)].map((m) => m[1]).slice(0, 12)

  const language =
    /itemprop="programmingLanguage">([^<]+)</.exec(html)?.[1]?.trim() ||
    /"primaryLanguage":\{"name":"([^"]+)"/.exec(html)?.[1] ||
    ''

  const license =
    /"license":\{"name":"([^"]+)"/.exec(html)?.[1] ||
    /"licenseInfo":\{"[^}]*?"name":"([^"]+)"/.exec(html)?.[1] ||
    ''

  const homepage = unescapeJson(/"homepageUrl":"([^"]*)"/.exec(html)?.[1] || '')

  const readme = await fetchReadme(owner, repo)

  return {
    owner,
    repo,
    fullName: `${owner}/${repo}`,
    name: repo,
    description,
    homepage,
    stars,
    forks,
    language,
    topics,
    license,
    archived: false,
    lastCommitAt: null,
    defaultBranch: 'HEAD',
    avatarUrl: `https://github.com/${owner}.png?size=200`,
    coverUrl: `https://opengraph.githubassets.com/1/${owner}/${repo}`,
    readme,
    latestRelease: '',
    htmlUrl: `https://github.com/${owner}/${repo}`,
  }
}

export async function fetchRepoInfo(input: string): Promise<RepoInfo> {
  const parsed = parseRepoUrl(input)
  if (!parsed) throw new Error('不是有效的 GitHub 仓库地址，例如 https://github.com/owner/repo')

  const { owner, repo } = parsed
  const res = await fetch(`${API}/repos/${owner}/${repo}`, {
    headers: headers(),
    cache: 'no-store',
  })

  if (res.status === 404) throw new Error('仓库不存在，或已被设为私有')
  if (res.status === 403 || res.status === 429) {
    // 匿名配额耗尽（共享 IP 很常见）时退回页面解析
    return fetchRepoFromHtml(owner, repo)
  }
  if (!res.ok) throw new Error(`GitHub 接口返回 ${res.status}`)

  const data = (await res.json()) as {
    name: string
    full_name: string
    description: string | null
    homepage: string | null
    stargazers_count: number
    forks_count: number
    language: string | null
    topics?: string[]
    license?: { spdx_id?: string; name?: string } | null
    archived: boolean
    pushed_at: string | null
    default_branch: string
    owner: { avatar_url: string; login: string }
    html_url: string
  }

  const [readme, latestRelease] = await Promise.all([
    fetchReadme(owner, repo),
    fetchLatestRelease(owner, repo),
  ])

  return {
    owner,
    repo,
    fullName: data.full_name,
    name: data.name,
    description: data.description || '',
    homepage: data.homepage || '',
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    language: data.language || '',
    topics: data.topics || [],
    license: data.license?.spdx_id || data.license?.name || '',
    archived: Boolean(data.archived),
    lastCommitAt: data.pushed_at,
    defaultBranch: data.default_branch,
    avatarUrl: data.owner?.avatar_url || `https://github.com/${owner}.png?size=200`,
    coverUrl: `https://opengraph.githubassets.com/1/${data.full_name}`,
    readme,
    latestRelease,
    htmlUrl: data.html_url,
  }
}

const PLATFORM_HINTS: Array<[RegExp, string]> = [
  [/macos|mac-os|\bosx\b|apple-silicon|homebrew/i, 'macos'],
  [/windows|win32|winget|scoop/i, 'windows'],
  [/linux|ubuntu|debian|archlinux/i, 'linux'],
  [/ios|iphone|ipad/i, 'ios'],
  [/android/i, 'android'],
  [/browser|chrome-extension|web-app/i, 'web'],
]

export function inferPlatforms(info: RepoInfo): string[] {
  const haystack = [info.description, ...info.topics, info.language].join(' ')
  const found = new Set<string>()
  for (const [re, platform] of PLATFORM_HINTS) {
    if (re.test(haystack)) found.add(platform)
  }
  return [...found]
}

export function inferKind(info: RepoInfo): string {
  const haystack = [info.name, info.description, ...info.topics].join(' ').toLowerCase()
  if (/mcp[-_ ]?server|model context protocol/.test(haystack)) return 'mcp-server'
  if (/claude[-_ ]?skill|agent[-_ ]?skill|awesome[-_ ]?skills/.test(haystack)) return 'ai-skill'
  if (/vscode|obsidian|chrome[-_ ]?extension|raycast|figma[-_ ]?plugin|browser[-_ ]?extension/.test(haystack))
    return 'plugin'
  if (/prompt/.test(haystack)) return 'prompt'
  if (/workflow|n8n|zapier|automation/.test(haystack)) return 'workflow'
  if (/\bcli\b|command[-_ ]?line|terminal/.test(haystack)) return 'cli'
  if (/\bai\b|llm|gpt|agent|inference|rag|embedding/.test(haystack)) return 'ai-tool'
  return 'app'
}

export function guessPricing(info: RepoInfo): string {
  return info.license ? 'open-source' : 'free'
}
