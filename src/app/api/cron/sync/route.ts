import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { enrichWithAI } from '@/lib/ai'
import { resolveCategoryId } from '@/lib/category'
import { fetchRepoInfo, inferKind, inferPlatforms, guessPricing } from '@/lib/github'
import { getIntegrationConfig } from '@/lib/integrations'
import { getPayloadClient } from '@/lib/payload'
import { slugify } from '@/lib/slug'
import { syncItemTags } from '@/lib/tags'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const DEFAULT_RULES = [
  { query: 'topic:macos-app stars:>1500 pushed:>2025-01-01', defaultKind: 'app' },
  { query: 'topic:windows-app stars:>1500 pushed:>2025-01-01', defaultKind: 'app' },
  { query: 'topic:mcp-server stars:>500 pushed:>2025-01-01', defaultKind: 'mcp-server' },
]

let cronRunning = false

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get('x-cron-secret') === secret
}

function ghHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Shelfry/1.0',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  const auth = token || process.env.GITHUB_TOKEN
  if (auth) headers.Authorization = `Bearer ${auth}`
  return headers
}

async function uniqueSlug(payload: any, base: string): Promise<string> {
  const root = slugify(base)
  let candidate = root
  let index = 2
  while (index < 30) {
    const existing = await payload.find({
      collection: 'items',
      where: { slug: { equals: candidate } },
      limit: 1,
      depth: 0,
    })
    if (!existing.docs.length) return candidate
    candidate = `${root}-${index}`
    index += 1
  }
  return `${root}-${Date.now().toString(36)}`
}

async function runRefresh(payload: any, limit: number, integration: any) {
  const stats = { updated: 0, failed: 0 }

  const never = await payload.find({
    collection: 'items',
    where: { status: { equals: 'published' }, lastSyncedAt: { exists: false } },
    limit,
    depth: 0,
  })

  let docs = never.docs
  if (docs.length < limit) {
    const rest = await payload.find({
      collection: 'items',
      where: { status: { equals: 'published' }, lastSyncedAt: { exists: true } },
      sort: 'lastSyncedAt',
      limit: limit - docs.length,
      depth: 0,
    })
    docs = [...docs, ...rest.docs]
  }

  for (const item of docs) {
    try {
      if (!item.repoUrl) continue
      const info = await fetchRepoInfo(item.repoUrl, integration.githubToken)
      await payload.update({
        collection: 'items',
        id: item.id,
        overrideAccess: true,
        context: { skipGithub: true },
        data: {
          stars: info.stars,
          forks: info.forks,
          lastCommitAt: info.lastCommitAt || undefined,
          latestRelease: info.latestRelease || item.latestRelease || undefined,
          archived: info.archived,
          readme: info.readme ? info.readme.slice(0, 80000) : item.readme || undefined,
          lastSyncedAt: new Date().toISOString(),
        },
      })
      stats.updated += 1
    } catch (error) {
      stats.failed += 1
      console.error('[cron:refresh] failed', item.slug, String(error))
    }
  }

  return stats
}

async function runEnrich(payload: any, limit: number, integration: any) {
  const stats = { enriched: 0, failed: 0 }

  const drafts = await payload.find({
    collection: 'items',
    where: { status: { equals: 'draft' } },
    sort: '-createdAt',
    limit,
    depth: 0,
  })

  for (const item of drafts.docs) {
    if (!item.repoUrl) continue
    if (item.tagline && item.summary && item.aiMeta?.enrichedAt) continue
    const lastAttempt = item.aiMeta?.lastAttemptAt ? new Date(item.aiMeta.lastAttemptAt).getTime() : 0
    if (lastAttempt && Date.now() - lastAttempt < 24 * 60 * 60 * 1000) continue
    try {
      const info = await fetchRepoInfo(item.repoUrl, integration.githubToken)
      const enrichment = await enrichWithAI(info, integration)
      const categoryId = item.category
        ? undefined
        : await resolveCategoryId(payload, enrichment.categoryHint, enrichment.kind || item.kind)

      await payload.update({
        collection: 'items',
        id: item.id,
        overrideAccess: true,
        context: { skipGithub: true },
        data: {
          tagline: item.tagline || enrichment.tagline,
          summary: item.summary || enrichment.summary,
          kind: item.kind || enrichment.kind,
          ...(categoryId ? { category: categoryId } : {}),
          platforms: item.platforms?.length ? item.platforms : enrichment.platforms,
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
          features:
            Array.isArray(item.features) && item.features.length
              ? item.features
              : enrichment.features.map((text: string) => ({ text })),
          aiMeta: {
            generated: enrichment.aiGenerated,
            model: integration.model || null,
            enrichedAt: new Date().toISOString(),
            categoryHint: enrichment.categoryHint,
          },
        },
      })
      stats.enriched += 1
    } catch (error) {
      stats.failed += 1
      console.error('[cron:enrich] failed', item.slug, String(error))
      try {
        await payload.update({
          collection: 'items',
          id: item.id,
          overrideAccess: true,
          context: { skipGithub: true, skipTagSync: true },
          data: {
            aiMeta: {
              ...(item.aiMeta || {}),
              lastAttemptAt: new Date().toISOString(),
              lastError: String(error).slice(0, 300),
            },
          },
        })
      } catch {
        /* 记录失败不影响本轮其他条目 */
      }
    }
  }

  return stats
}

async function runDiscover(payload: any, integration: any, perRule = 8) {
  const stats = { found: 0, created: 0, skipped: 0, rules: 0 }

  const settings = await payload.findGlobal({ slug: 'settings', depth: 0, overrideAccess: true })
  const configured = Array.isArray(settings?.discoveryRules)
    ? settings.discoveryRules.filter((rule: any) => rule?.enabled && rule?.query)
    : []

  const rules = configured.length
    ? configured.map((rule: any) => ({ query: rule.query, defaultKind: rule.defaultKind || 'app' }))
    : DEFAULT_RULES

  for (const rule of rules.slice(0, 4)) {
    stats.rules += 1
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(
          rule.query,
        )}&sort=stars&order=desc&per_page=${perRule}`,
        { headers: ghHeaders(integration.githubToken), cache: 'no-store' },
      )
      if (!response.ok) continue
      const data = (await response.json()) as { items?: any[] }
      const repos = data.items || []
      stats.found += repos.length

      for (const repo of repos) {
        const existing = await payload.find({
          collection: 'items',
          where: { githubFullName: { equals: repo.full_name } },
          limit: 1,
          depth: 0,
        })
        if (existing.docs.length) {
          stats.skipped += 1
          continue
        }

        const autoPublish =
          Boolean(settings?.autoPublish) &&
          Number(repo.stargazers_count || 0) >= Number(settings?.autoPublishStars || 800)

        const categoryId = await resolveCategoryId(payload, '', rule.defaultKind || 'app')

        const infoLike = {
          name: repo.name,
          description: repo.description || '',
          topics: repo.topics || [],
          language: repo.language || '',
        }

        await payload.create({
          collection: 'items',
          overrideAccess: true,
          context: { skipGithub: true },
          data: {
            name: repo.name,
            slug: await uniqueSlug(payload, repo.name),
            repoUrl: repo.html_url,
            githubFullName: repo.full_name,
            homepage: repo.homepage || '',
            tagline: repo.description || '',
            summary: repo.description || '',
            kind: rule.defaultKind || inferKind(infoLike as any),
            category: categoryId,
            platforms: inferPlatforms(infoLike as any),
            pricing: guessPricing({ license: repo.license?.spdx_id } as any),
            license: repo.license?.spdx_id || '',
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            language: repo.language || '',
            topicsText: (repo.topics || []).join(', '),
            lastCommitAt: repo.pushed_at || undefined,
            iconUrl: repo.owner?.avatar_url || '',
            coverUrl: `https://opengraph.githubassets.com/1/${repo.full_name}`,
            status: autoPublish ? 'published' : 'draft',
            publishedAt: autoPublish ? new Date().toISOString() : undefined,
            source: 'discovery',
            lastSyncedAt: new Date().toISOString(),
          },
        })
        stats.created += 1
      }
    } catch (error) {
      console.error('[cron:discover] rule failed', rule.query, String(error))
    }
  }

  return stats
}


async function runReadme(payload: any, limit: number, integration: any) {
  const stats = { filled: 0, failed: 0 }

  const docs = await payload.find({
    collection: 'items',
    where: { readme: { exists: false } },
    limit,
    depth: 0,
  })

  for (const item of docs.docs) {
    if (!item.repoUrl) continue
    try {
      const info = await fetchRepoInfo(item.repoUrl, integration.githubToken)
      await payload.update({
        collection: 'items',
        id: item.id,
        overrideAccess: true,
        context: { skipGithub: true },
        data: {
          readme: info.readme ? info.readme.slice(0, 80000) : '',
          lastSyncedAt: new Date().toISOString(),
        },
      })
      stats.filled += 1
    } catch (error) {
      stats.failed += 1
      console.error('[cron:readme] failed', item.slug, String(error))
    }
  }

  return stats
}


async function runTags(payload: any, limit: number) {
  const stats = { linked: 0, failed: 0 }

  const docs = await payload.find({
    collection: 'items',
    where: {
      tags: { exists: false },
    },
    limit,
    depth: 0,
  })

  for (const item of docs.docs) {
    try {
      const linked = await syncItemTags(payload, item)
      if (linked) stats.linked += 1
    } catch (error) {
      stats.failed += 1
      console.error('[cron:tags] failed', item.slug, String(error))
    }
  }

  return stats
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (cronRunning) {
    return NextResponse.json({ error: '上一个同步任务还在运行，请稍后重试' }, { status: 409 })
  }

  cronRunning = true

  try {
  const task = request.nextUrl.searchParams.get('task') || 'refresh'
  const payload = await getPayloadClient()
  const integration = await getIntegrationConfig(payload as any)

  const run = await payload.create({
    collection: 'sync-runs',
    overrideAccess: true,
    data: {
      type:
        task === 'discover'
          ? 'discover'
          : task === 'enrich'
            ? 'enrich'
            : task === 'readme'
              ? 'readme'
              : task === 'tags'
                ? 'tags'
                : 'refresh',
      status: 'running',
      trigger: 'cron',
      startedAt: new Date().toISOString(),
    },
  })

  try {
    const settings = await payload.findGlobal({ slug: 'settings', depth: 0, overrideAccess: true })
    const refreshLimit = Math.min(60, Number(settings?.refreshLimit) || 30)

    let stats: Record<string, number> = {}
    if (task === 'discover') stats = await runDiscover(payload, integration)
    else if (task === 'enrich') stats = await runEnrich(payload, 6, integration)
    else if (task === 'readme') stats = await runReadme(payload, 20, integration)
    else if (task === 'tags') stats = await runTags(payload, 40)
    else stats = await runRefresh(payload, refreshLimit, integration)

    await payload.update({
      collection: 'sync-runs',
      id: run.id,
      overrideAccess: true,
      data: {
        status: 'success',
        finishedAt: new Date().toISOString(),
        stats,
      },
    })

    return NextResponse.json({ ok: true, task, stats })
  } catch (error) {
    await payload.update({
      collection: 'sync-runs',
      id: run.id,
      overrideAccess: true,
      data: {
        status: 'failed',
        finishedAt: new Date().toISOString(),
        message: String(error).slice(0, 2000),
      },
    })
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
  } finally {
    cronRunning = false
  }
}
