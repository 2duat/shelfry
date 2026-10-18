type PayloadLike = {
  findGlobal: (args: any) => Promise<any>
}

export type IntegrationConfig = {
  githubToken?: string
  baseUrl?: string
  apiKey?: string
  model?: string
}

let cached: { at: number; value: IntegrationConfig } | null = null

/**
 * 读取后台「采集与 AI」里的配置，环境变量优先。
 * 60 秒缓存，避免每次导入都查一遍 globals。
 */
export async function getIntegrationConfig(payload: PayloadLike): Promise<IntegrationConfig> {
  if (cached && Date.now() - cached.at < 60_000) return cached.value

  let settings: any = {}
  try {
    settings = await payload.findGlobal({
      slug: 'settings',
      depth: 0,
      overrideAccess: true,
    })
  } catch {
    settings = {}
  }

  const value: IntegrationConfig = {
    githubToken: process.env.GITHUB_TOKEN || settings?.githubToken || undefined,
    baseUrl: process.env.LLM_BASE_URL || settings?.llmBaseUrl || undefined,
    apiKey: process.env.LLM_API_KEY || settings?.llmApiKey || undefined,
    model: process.env.LLM_MODEL || settings?.llmModel || undefined,
  }

  cached = { at: Date.now(), value }
  return value
}
