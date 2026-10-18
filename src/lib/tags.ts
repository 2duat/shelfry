import { HOSTS, KINDS, PLATFORMS, labelOf } from './constants'
import { slugify } from './slug'

type PayloadLike = {
  find: (args: any) => Promise<{ docs: any[] }>
  create: (args: any) => Promise<any>
  update: (args: any) => Promise<any>
}

/**
 * 把条目的标签文本（逗号分隔）同步成真正的 Tag 记录并关联到条目。
 * 只在条目还没有手动标签时执行，避免覆盖编辑的选择。
 */
export async function syncItemTags(payload: PayloadLike, doc: any, req?: any): Promise<number> {
  const existing = Array.isArray(doc?.tags) ? doc.tags.filter(Boolean) : []
  if (existing.length) return 0

  let labels = String(doc?.tagsText || '')
    .split(/[,，]/)
    .map((label) => label.trim())
    .filter(Boolean)
    .slice(0, 8)

  // 没有标签文本时（例如 README 没有 Topics），用结构化信息兜底
  if (!labels.length) {
    const derived: string[] = []
    if (doc?.kind) derived.push(labelOf(KINDS, doc.kind))
    if (doc?.host) derived.push(labelOf(HOSTS, doc.host))
    for (const platform of Array.isArray(doc?.platforms) ? doc.platforms : []) {
      derived.push(labelOf(PLATFORMS, platform))
    }
    if (doc?.language) derived.push(String(doc.language))
    labels = [...new Set(derived.map((item) => item.trim()).filter(Boolean))].slice(0, 6)
  }

  if (!labels.length) return 0

  const ids: Array<string | number> = []

  for (const label of labels) {
    const slug = slugify(label)
    if (!slug) continue

    const found = await payload.find({
      collection: 'tags',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })

    if (found.docs[0]) {
      ids.push(found.docs[0].id)
      continue
    }

    const created = await payload.create({
      collection: 'tags',
      data: { name: label, slug, group: 'topic' },
      overrideAccess: true,
      req,
    })
    ids.push(created.id)
  }

  if (!ids.length) return 0

  await payload.update({
    collection: 'items',
    id: doc.id,
    data: { tags: ids },
    overrideAccess: true,
    req,
    context: { skipTagSync: true, skipGithub: true },
  })

  return ids.length
}
