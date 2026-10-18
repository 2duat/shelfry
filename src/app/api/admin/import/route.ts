import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { enrichWithAI } from '@/lib/ai'
import { resolveCategoryId } from '@/lib/category'
import { getIntegrationConfig } from '@/lib/integrations'
import { fetchRepoInfo, parseRepoUrl } from '@/lib/github'
import { getPayloadClient } from '@/lib/payload'
import { slugify } from '@/lib/slug'

async function uniqueSlug(payload: any, base: string) {
  const root = slugify(base)
  let candidate = root
  let index = 2
  while (index < 50) {
    const found = await payload.find({
      collection: 'items',
      where: { slug: { equals: candidate } },
      limit: 1,
      depth: 0,
    })
    if (!found.docs.length) return candidate
    candidate = `${root}-${index}`
    index += 1
  }
  return `${root}-${Date.now().toString(36)}`
}

export async function POST(request: NextRequest) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return NextResponse.json({ error: '请先登录后台' }, { status: 401 })
  }

  let body: { repoUrl?: string; status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  const repoUrl = String(body.repoUrl || '').trim()
  const parsed = parseRepoUrl(repoUrl)
  if (!parsed) {
    return NextResponse.json(
      { error: '请填写有效的 GitHub 地址，例如 https://github.com/owner/repo' },
      { status: 400 },
    )
  }

  const status = body.status === 'published' ? 'published' : 'draft'

  try {
    const integration = await getIntegrationConfig(payload as any)
    const info = await fetchRepoInfo(repoUrl, integration.githubToken)

    const existing = await payload.find({
      collection: 'items',
      where: { githubFullName: { equals: info.fullName } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      return NextResponse.json(
        {
          error: '这个仓库已经在库里了',
          existing: {
            id: existing.docs[0].id,
            name: (existing.docs[0] as any).name,
            slug: (existing.docs[0] as any).slug,
          },
        },
        { status: 409 },
      )
    }

    const enrichment = await enrichWithAI(info, integration)
    const categoryId = await resolveCategoryId(payload as any, enrichment.categoryHint, enrichment.kind)

    const doc = await payload.create({
      collection: 'items',
      overrideAccess: true,
      context: { skipGithub: true },
      data: {
        name: info.name,
        slug: await uniqueSlug(payload, info.name),
        repoUrl: info.htmlUrl,
        githubFullName: info.fullName,
        homepage: info.homepage,
        tagline: enrichment.tagline,
        summary: enrichment.summary,
        kind: enrichment.kind,
        category: categoryId,
        platforms: enrichment.platforms,
        pricing: enrichment.pricing || 'open-source',
        license: info.license,
        stars: info.stars,
        forks: info.forks,
        language: info.language,
        topicsText: info.topics.join(', '),
        lastCommitAt: info.lastCommitAt || undefined,
        latestRelease: info.latestRelease || undefined,
        iconUrl: info.avatarUrl,
        coverUrl: info.coverUrl,
        readme: info.readme ? info.readme.slice(0, 80000) : undefined,
        installCommand: enrichment.installHint,
        features: enrichment.features.map((text) => ({ text })),
        tagsText: enrichment.tags.join(', '),
        status,
        publishedAt: status === 'published' ? new Date().toISOString() : undefined,
        source: 'manual',
        lastSyncedAt: new Date().toISOString(),
        aiMeta: {
          generated: enrichment.aiGenerated,
          model: enrichment.aiGenerated ? integration.model || null : null,
          enrichedAt: new Date().toISOString(),
          categoryHint: enrichment.categoryHint,
          audience: enrichment.audience,
        },
      } as any,
    })

    return NextResponse.json({
      ok: true,
      id: doc.id,
      name: (doc as any).name,
      slug: (doc as any).slug,
      stars: info.stars,
      status,
    })
  } catch (error) {
    console.error('[admin:import] failed', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '导入失败，请稍后重试' },
      { status: 500 },
    )
  }
}
