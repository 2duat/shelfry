import { enrichWithAI } from './ai'
import { resolveCategoryId } from './category'
import { fetchRepoInfo } from './github'
import type { IntegrationConfig } from './integrations'

/**
 * 补全一条项目：抓 GitHub（含 README）+ AI 文案，然后写回条目。
 * 手动补全、定时补全、导入后补全都走这一套字段。
 */
export async function enrichItem(
  payload: any,
  item: any,
  integration: IntegrationConfig,
): Promise<{ aiGenerated: boolean; readmeLength: number }> {
  if (!item?.repoUrl) throw new Error('这个条目没有 GitHub 地址')

  const info = await fetchRepoInfo(item.repoUrl, integration.githubToken)
  const enrichment = await enrichWithAI(info, integration)
  const isNewDiscovery = item.source === 'discovery' && !item.aiMeta?.enrichedAt
  const categoryId = item.category
    ? undefined
    : await resolveCategoryId(payload, enrichment.categoryHint, enrichment.kind || item.kind)

  await payload.update({
    collection: 'items',
    id: item.id,
    overrideAccess: true,
    context: { skipGithub: true },
    data: {
      readme: info.readme ? info.readme.slice(0, 80000) : item.readme || undefined,
      tagline: isNewDiscovery ? enrichment.tagline : item.tagline || enrichment.tagline,
      summary: isNewDiscovery ? enrichment.summary : item.summary || enrichment.summary,
      kind: item.kind || enrichment.kind,
      ...(categoryId ? { category: categoryId } : {}),
      platforms: item.platforms?.length
        ? item.platforms
        : enrichment.platforms.length
          ? enrichment.platforms
          : ['web'],
      tagsText: item.tagsText || enrichment.tags.join(', '),
      installCommand: item.installCommand || enrichment.installHint,
      pricing: item.pricing || enrichment.pricing,
      license: item.license || info.license,
      stars: info.stars,
      forks: info.forks,
      language: info.language,
      topicsText: info.topics.join(', '),
      iconUrl: item.iconUrl || info.avatarUrl,
      coverUrl: item.coverUrl || info.coverUrl,
      lastCommitAt: info.lastCommitAt || undefined,
      latestRelease: info.latestRelease || item.latestRelease || undefined,
      archived: info.archived,
      lastSyncedAt: new Date().toISOString(),
      features:
        Array.isArray(item.features) && item.features.length
          ? item.features
          : enrichment.features.map((text: string) => ({ text })),
      aiMeta: {
        generated: enrichment.aiGenerated,
        model: integration.model || null,
        lastAttemptAt: new Date().toISOString(),
        ...(enrichment.aiGenerated
          ? { enrichedAt: new Date().toISOString() }
          : { lastError: 'AI 未返回有效 JSON，稍后重试' }),
        categoryHint: enrichment.categoryHint,
        audience: enrichment.audience,
        readmeLength: info.readme.length,
      },
    },
  })

  return { aiGenerated: enrichment.aiGenerated, readmeLength: info.readme.length }
}
