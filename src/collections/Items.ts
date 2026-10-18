import type { CollectionConfig } from 'payload'
import { enrichWithAI } from '../lib/ai'
import { resolveCategoryId } from '../lib/category'
import { fetchRepoInfo } from '../lib/github'
import { computeScore } from '../lib/score'
import { slugify } from '../lib/slug'
import { syncItemTags } from '../lib/tags'
import { authenticated, publishedOrAuthenticated } from './access'

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  return []
}

async function uniqueItemSlug(payload: any, base: string, currentId?: string | number) {
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
    const owner = found.docs[0]
    if (!owner || owner.id === currentId) return candidate
    candidate = `${root}-${index}`
    index += 1
  }
  return `${root}-${Date.now().toString(36)}`
}

export const Items: CollectionConfig = {
  slug: 'items',
  labels: { singular: '软件条目', plural: '软件条目' },
  admin: {
    useAsTitle: 'name',
    group: '内容',
    defaultColumns: ['name', 'kind', 'status', 'stars', 'updatedAt'],
    listSearchableFields: ['name', 'githubFullName', 'tagline', 'tagsText'],
    components: {
      beforeListTable: ['/components/admin/GithubImport#GithubImport'],
    },
    description:
      '常用信息都在第一屏；发布状态、推荐位在右侧栏。自动抓取的字段收在「GitHub 数据」里，平时不用管。',
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, operation, req }) => {
        if (!data) return data
        const current = { ...(originalDoc || {}), ...data } as Record<string, any>

        const slugWasMissing = !current.slug
        if (slugWasMissing) {
          const repoName = String(current.githubFullName || '').split('/')[1]
          data.slug = slugify(repoName || current.name || 'item')
        }

        const shouldFetch =
          Boolean(current.repoUrl) &&
          !(req.context as any)?.skipGithub &&
          (operation === 'create' ||
            data.repoUrl !== originalDoc?.repoUrl ||
            Boolean(data.syncNow))

        if (!shouldFetch) return data

        try {
          const info = await fetchRepoInfo(String(current.repoUrl))
          const enrich = await enrichWithAI(info)

          const existing = await req.payload.find({
            collection: 'items',
            where: { githubFullName: { equals: info.fullName } },
            limit: 1,
            depth: 0,
          })
          const duplicate = existing.docs.find((doc: any) => doc.id !== originalDoc?.id)
          if (duplicate) {
            throw new Error(`该仓库已存在：${(duplicate as any).name}，请直接编辑那一条`)
          }

          data.name = current.name || info.name
          if (slugWasMissing) {
            data.slug = await uniqueItemSlug(req.payload, info.name, originalDoc?.id)
          }
          data.githubFullName = info.fullName
          data.repoUrl = info.htmlUrl
          data.homepage = current.homepage || info.homepage
          data.stars = info.stars
          data.forks = info.forks
          data.language = info.language
          data.topicsText = info.topics.join(', ')
          data.license = current.license || info.license
          data.archived = info.archived
          data.lastCommitAt = info.lastCommitAt || undefined
          data.latestRelease = info.latestRelease || current.latestRelease
          data.iconUrl = current.iconUrl || info.avatarUrl
          data.coverUrl = current.coverUrl || info.coverUrl
          data.readme = info.readme ? info.readme.slice(0, 80000) : current.readme || undefined
          data.summary = current.summary || enrich.summary
          data.tagline = current.tagline || enrich.tagline
          data.installCommand = current.installCommand || enrich.installHint
          data.pricing = current.pricing || enrich.pricing
          data.kind = current.kind || enrich.kind
          if (!current.category) {
            const categoryId = await resolveCategoryId(
              req.payload as any,
              enrich.categoryHint,
              String(data.kind || current.kind || 'app'),
              req,
            )
            if (categoryId) data.category = categoryId as any
          }
          data.platforms = asArray(current.platforms).length
            ? current.platforms
            : enrich.platforms.filter(Boolean)
          data.tagsText = current.tagsText || enrich.tags.join(', ')
          data.features =
            Array.isArray(current.features) && current.features.length
              ? current.features
              : enrich.features.map((text) => ({ text }))
          data.aiMeta = {
            generated: enrich.aiGenerated,
            model: enrich.aiGenerated ? process.env.LLM_MODEL || null : null,
            enrichedAt: new Date().toISOString(),
            categoryHint: enrich.categoryHint,
            audience: enrich.audience,
            readmeLength: info.readme.length,
          }
        } catch (err) {
          req.payload.logger.warn(`[items] GitHub 抓取失败: ${String(err)}`)
          if (err instanceof Error && err.message.includes('已存在')) throw err
        } finally {
          data.syncNow = false
        }

        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        const merged = { ...(originalDoc || {}), ...data } as Record<string, any>

        data.searchText = [
          merged.name,
          merged.tagline,
          merged.summary,
          merged.language,
          merged.tagsText,
          merged.topicsText,
          merged.installCommand,
          ...asArray(merged.platforms),
        ]
          .filter(Boolean)
          .join(' ')
          .slice(0, 4000)

        data.score = computeScore({
          stars: merged.stars,
          forks: merged.forks,
          lastCommitAt: merged.lastCommitAt,
          featured: merged.featured,
          editorsPick: merged.editorsPick,
          clicks: merged.clicks,
        })

        if (merged.status === 'published' && !merged.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        if ((req.context as any)?.skipTagSync) return doc
        try {
          await syncItemTags(req.payload as any, doc, req)
        } catch (error) {
          req.payload.logger.warn(`[items] 标签同步失败: ${String(error)}`)
        }
        return doc
      },
    ],
  },
  fields: [
    /* ---------- 右侧栏：发布与推荐 ---------- */
    {
      name: 'status',
      label: '状态',
      type: 'select',
      defaultValue: 'draft',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
      options: [
        { label: '草稿', value: 'draft' },
        { label: '已发布', value: 'published' },
        { label: '已隐藏', value: 'hidden' },
      ],
    },
    {
      name: 'featured',
      label: '首页推荐',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'editorsPick',
      label: '编辑精选',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      label: '发布时间',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'syncNow',
      label: '重新抓取 GitHub',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: '保存时重新拉取星标、更新时间与 AI 文案',
      },
    },

    /* ---------- 主区域 ---------- */
    {
      type: 'tabs',
      tabs: [
        {
          label: '内容',
          fields: [
            {
              name: 'repoUrl',
              label: 'GitHub 地址',
              type: 'text',
              admin: {
                description: '粘贴后保存会自动补全；也可以直接用列表页的「一键导入」',
                placeholder: 'https://github.com/owner/repo',
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'name', label: '名称', type: 'text', required: true, admin: { width: '60%' } },
                {
                  name: 'slug',
                  label: 'URL 标识',
                  type: 'text',
                  unique: true,
                  index: true,
                  admin: { width: '40%' },
                },
              ],
            },
            {
              name: 'tagline',
              label: '一句话介绍',
              type: 'text',
              admin: { description: '建议 20–40 字，用于列表卡片' },
            },
            {
              name: 'summary',
              label: '简介',
              type: 'textarea',
              admin: { description: '150–220 字，详情页顶部展示' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'kind',
                  label: '类型',
                  type: 'select',
                  defaultValue: 'app',
                  admin: { width: '34%' },
                  options: [
                    { label: '应用', value: 'app' },
                    { label: '命令行工具', value: 'cli' },
                    { label: '插件 / 扩展', value: 'plugin' },
                    { label: 'AI 工具', value: 'ai-tool' },
                    { label: 'AI 技能', value: 'ai-skill' },
                    { label: 'MCP Server', value: 'mcp-server' },
                    { label: '提示词', value: 'prompt' },
                    { label: '工作流', value: 'workflow' },
                  ],
                },
                {
                  name: 'pricing',
                  label: '收费模式',
                  type: 'select',
                  defaultValue: 'open-source',
                  admin: { width: '33%' },
                  options: [
                    { label: '完全开源', value: 'open-source' },
                    { label: '免费', value: 'free' },
                    { label: '免费增值', value: 'freemium' },
                    { label: '付费', value: 'paid' },
                  ],
                },
                { name: 'license', label: '开源协议', type: 'text', admin: { width: '33%' } },
              ],
            },
            {
              name: 'platforms',
              label: '支持平台',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'macOS', value: 'macos' },
                { label: 'Windows', value: 'windows' },
                { label: 'Linux', value: 'linux' },
                { label: 'Web', value: 'web' },
                { label: 'iOS', value: 'ios' },
                { label: 'Android', value: 'android' },
              ],
            },
            {
              name: 'host',
              label: '宿主平台（插件用）',
              type: 'select',
              options: [
                { label: 'VS Code', value: 'vscode' },
                { label: 'Obsidian', value: 'obsidian' },
                { label: 'Chrome', value: 'chrome' },
                { label: 'Raycast', value: 'raycast' },
                { label: 'Figma', value: 'figma' },
                { label: 'Cursor', value: 'cursor' },
                { label: 'Claude', value: 'claude' },
                { label: 'n8n', value: 'n8n' },
                { label: '其他', value: 'other' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  label: '分类',
                  type: 'relationship',
                  relationTo: 'categories',
                  admin: { width: '50%' },
                },
                {
                  name: 'tags',
                  label: '标签',
                  type: 'relationship',
                  relationTo: 'tags',
                  hasMany: true,
                  admin: {
                    width: '50%',
                    description: '导入时会根据标签文本自动创建并关联',
                  },
                },
              ],
            },
            {
              name: 'tagsText',
              label: '标签文本',
              type: 'text',
              admin: { description: '逗号分隔；用于自动生成上面的标签' },
            },
            {
              name: 'features',
              label: '核心功能',
              type: 'array',
              fields: [{ name: 'text', label: '内容', type: 'text', required: true }],
            },
            { name: 'body', label: '正文', type: 'richText' },
            { name: 'audience', label: '适合人群', type: 'text' },
          ],
        },
        {
          label: '链接与图片',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'homepage', label: '官网', type: 'text', admin: { width: '50%' } },
                { name: 'downloadUrl', label: '下载地址', type: 'text', admin: { width: '50%' } },
              ],
            },
            { name: 'installCommand', label: '安装命令', type: 'text' },
            {
              type: 'row',
              fields: [
                { name: 'iconUrl', label: '图标地址', type: 'text', admin: { width: '50%' } },
                { name: 'coverUrl', label: '封面图地址', type: 'text', admin: { width: '50%' } },
              ],
            },
            {
              name: 'screenshots',
              label: '截图',
              type: 'array',
              fields: [
                { name: 'url', label: '图片地址', type: 'text', required: true },
                { name: 'caption', label: '说明', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'GitHub 数据',
          fields: [
            {
              type: 'collapsible',
              label: '仓库信息（自动抓取）',
              admin: { initCollapsed: true },
              fields: [
                { name: 'githubFullName', label: 'owner/repo', type: 'text', index: true, admin: { readOnly: true } },
                {
                  type: 'row',
                  fields: [
                    { name: 'stars', label: 'Stars', type: 'number', admin: { readOnly: true, width: '33%' } },
                    { name: 'forks', label: 'Forks', type: 'number', admin: { readOnly: true, width: '33%' } },
                    { name: 'language', label: '主要语言', type: 'text', admin: { readOnly: true, width: '34%' } },
                  ],
                },
                { name: 'topicsText', label: 'Topics', type: 'text', admin: { readOnly: true } },
                {
                  type: 'row',
                  fields: [
                    { name: 'lastCommitAt', label: '最后提交', type: 'date', admin: { readOnly: true, width: '50%' } },
                    { name: 'latestRelease', label: '最新版本', type: 'text', admin: { readOnly: true, width: '50%' } },
                  ],
                },
                { name: 'archived', label: '已归档', type: 'checkbox', admin: { readOnly: true } },
                {
                  name: 'lastSyncedAt',
                  label: '上次同步',
                  type: 'date',
                  admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
                },
                {
                  name: 'source',
                  label: '来源',
                  type: 'select',
                  defaultValue: 'manual',
                  options: [
                    { label: '手动录入', value: 'manual' },
                    { label: '自动发现', value: 'discovery' },
                    { label: '榜单导入', value: 'awesome' },
                    { label: '用户投稿', value: 'submission' },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: '排序与统计',
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'score', label: '排序分', type: 'number', admin: { readOnly: true, width: '50%' } },
                    { name: 'clicks', label: '外链点击', type: 'number', defaultValue: 0, admin: { readOnly: true, width: '50%' } },
                  ],
                },
                { name: 'aiMeta', label: 'AI 元信息', type: 'json', admin: { readOnly: true } },
              ],
            },
            {
              type: 'collapsible',
              label: 'README 内容',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'readme',
                  label: 'README',
                  type: 'textarea',
                  maxLength: 120000,
                  admin: {
                    readOnly: true,
                    description: '详情页 README 阅读区的内容，导入或刷新时自动抓取',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              label: 'SEO',
              type: 'group',
              fields: [
                { name: 'title', label: '标题', type: 'text' },
                { name: 'description', label: '描述', type: 'textarea' },
              ],
            },
          ],
        },
      ],
    },

    {
      name: 'searchText',
      label: '搜索文本',
      type: 'text',
      index: true,
      admin: { hidden: true, readOnly: true },
    },
  ],
}
