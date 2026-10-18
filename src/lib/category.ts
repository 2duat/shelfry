const HINT_TO_SLUG: Record<string, string> = {
  效率工具: 'efficiency',
  开发工具: 'dev',
  'AI 与智能': 'ai',
  'AI与智能': 'ai',
  系统增强: 'system',
  设计创意: 'design',
  媒体影音: 'media',
  笔记知识: 'notes',
  网络工具: 'network',
  安全隐私: 'security',
  终端工具: 'terminal',
}

const KIND_TO_SLUG: Record<string, string> = {
  cli: 'terminal',
  app: 'efficiency',
  plugin: 'efficiency',
  'ai-tool': 'ai',
  'ai-skill': 'ai',
  'mcp-server': 'ai',
  prompt: 'ai',
  workflow: 'ai',
}

type PayloadLike = {
  find: (args: any) => Promise<{ docs: any[] }>
}

/**
 * 把 AI 给出的分类名 / 类型，解析成真实的分类 ID。
 * 优先按分类名匹配（管理员可以改分类名），其次按 slug，最后按类型兜底。
 */
export async function resolveCategoryId(
  payload: PayloadLike,
  hint?: string | null,
  kind?: string | null,
  req?: any,
): Promise<string | number | undefined> {
  const cleanHint = String(hint || '').trim()

  if (cleanHint) {
    try {
      const byName = await payload.find({
        collection: 'categories',
        where: { name: { equals: cleanHint } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req,
      })
      if (byName.docs[0]) return byName.docs[0].id
    } catch {
      /* 忽略，继续按 slug 匹配 */
    }
  }

  const slug = HINT_TO_SLUG[cleanHint] || KIND_TO_SLUG[String(kind || '')] || 'efficiency'

  try {
    const bySlug = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    return bySlug.docs[0]?.id
  } catch {
    return undefined
  }
}
