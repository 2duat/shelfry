import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { enrichWithAI } from '@/lib/ai'
import { fetchRepoInfo } from '@/lib/github'
import { getPayloadClient } from '@/lib/payload'
import { slugify } from '@/lib/slug'

const CATEGORIES = [
  { name: '效率工具', slug: 'efficiency', icon: 'Zap', description: '让日常操作更快一步', sort: 10 },
  { name: '开发工具', slug: 'dev', icon: 'Code2', description: '编码、调试与协作', sort: 20 },
  { name: 'AI 与智能', slug: 'ai', icon: 'Sparkles', description: 'AI 应用、模型与 Agent 能力', sort: 30 },
  { name: '系统增强', slug: 'system', icon: 'SlidersHorizontal', description: '窗口、菜单栏与系统能力', sort: 40 },
  { name: '设计创意', slug: 'design', icon: 'Figma', description: '设计、绘图与素材', sort: 50 },
  { name: '媒体影音', slug: 'media', icon: 'PlayCircle', description: '播放、剪辑与转码', sort: 60 },
  { name: '笔记知识', slug: 'notes', icon: 'BookOpen', description: '笔记、知识库与阅读', sort: 70 },
  { name: '网络工具', slug: 'network', icon: 'Globe2', description: '下载、代理与网络诊断', sort: 80 },
  { name: '安全隐私', slug: 'security', icon: 'ShieldCheck', description: '加密、权限与隐私保护', sort: 90 },
  { name: '终端工具', slug: 'terminal', icon: 'Terminal', description: '命令行里的效率', sort: 100 },
]

const TAGS = [
  { name: '跨平台', slug: 'cross-platform', group: 'topic' },
  { name: '开源替代', slug: 'open-source-alternative', group: 'topic' },
  { name: '本地优先', slug: 'local-first', group: 'topic' },
  { name: '命令行', slug: 'cli', group: 'tech' },
  { name: '轻量', slug: 'lightweight', group: 'topic' },
  { name: '隐私友好', slug: 'privacy', group: 'topic' },
  { name: 'AI 驱动', slug: 'ai-powered', group: 'tech' },
]

type SeedRepo = {
  url: string
  category: string
  kinds?: string
  platforms?: string[]
  host?: string
  tagline?: string
  featured?: boolean
  editorsPick?: boolean
}

const REPOS: SeedRepo[] = [
  {
    url: 'https://github.com/exelban/stats',
    category: 'system',
    platforms: ['macos'],
    tagline: 'macOS 菜单栏里的系统监控，CPU、内存、磁盘、网络一眼看清',
    featured: true,
    editorsPick: true,
  },
  {
    url: 'https://github.com/iina/iina',
    category: 'media',
    platforms: ['macos'],
    tagline: 'macOS 上最受欢迎的开源视频播放器，基于 mpv，几乎什么格式都能放',
    featured: true,
    editorsPick: true,
  },
  {
    url: 'https://github.com/utmapp/UTM',
    category: 'system',
    platforms: ['macos', 'ios'],
    tagline: '在 Mac 和 iPhone 上跑 Windows、Linux 虚拟机，基于 QEMU',
    editorsPick: true,
  },
  {
    url: 'https://github.com/microsoft/PowerToys',
    category: 'system',
    platforms: ['windows'],
    tagline: '微软官方出品的 Windows 效率增强套件，FancyZones、PowerRename 都在里面',
    featured: true,
    editorsPick: true,
  },
  {
    url: 'https://github.com/ShareX/ShareX',
    category: 'efficiency',
    platforms: ['windows'],
    tagline: 'Windows 上功能最全的截图、录屏与文件分享工具',
    editorsPick: true,
  },
  {
    url: 'https://github.com/Flow-Launcher/Flow.Launcher',
    category: 'efficiency',
    platforms: ['windows'],
    tagline: 'Windows 上的快捷启动器，一个输入框直达文件、应用和网页',
  },
  {
    url: 'https://github.com/ollama/ollama',
    category: 'ai',
    platforms: ['macos', 'windows', 'linux'],
    kinds: 'ai-tool',
    tagline: '一条命令在本机跑起 Llama、Qwen、DeepSeek 等大模型',
    featured: true,
    editorsPick: true,
  },
  {
    url: 'https://github.com/langgenius/dify',
    category: 'ai',
    platforms: ['web'],
    kinds: 'ai-tool',
    tagline: '开源 LLM 应用开发平台，拖拉拽就能搭出 AI 工作流',
    editorsPick: true,
  },
  {
    url: 'https://github.com/n8n-io/n8n',
    category: 'ai',
    platforms: ['web'],
    kinds: 'workflow',
    tagline: '可自托管的自动化工作流平台，把 400+ 服务连起来',
    featured: true,
  },
  {
    url: 'https://github.com/modelcontextprotocol/servers',
    category: 'ai',
    platforms: ['macos', 'windows', 'linux'],
    kinds: 'mcp-server',
    tagline: 'MCP 官方服务器集合，让 AI 能读文件、查数据库、调 API',
    editorsPick: true,
  },
  {
    url: 'https://github.com/raycast/extensions',
    category: 'efficiency',
    platforms: ['macos'],
    kinds: 'plugin',
    host: 'raycast',
    tagline: 'Raycast 的插件仓库，上千个扩展把 Mac 变成效率机器',
  },
  {
    url: 'https://github.com/zsviczian/obsidian-excalidraw-plugin',
    category: 'notes',
    platforms: ['macos', 'windows', 'linux'],
    kinds: 'plugin',
    host: 'obsidian',
    tagline: '在 Obsidian 里画手绘图与流程图，白板式思考',
  },
  {
    url: 'https://github.com/sharkdp/bat',
    category: 'terminal',
    platforms: ['macos', 'windows', 'linux'],
    kinds: 'cli',
    tagline: '带语法高亮和 Git 标记的 cat 替代品',
    editorsPick: true,
  },
  {
    url: 'https://github.com/junegunn/fzf',
    category: 'terminal',
    platforms: ['macos', 'windows', 'linux'],
    kinds: 'cli',
    tagline: '命令行里的模糊搜索神器，文件和历史记录秒搜',
  },
  {
    url: 'https://github.com/koekeishiya/skhd',
    category: 'efficiency',
    platforms: ['macos'],
    kinds: 'cli',
    tagline: 'macOS 上的轻量快捷键守护进程，用配置文件定义全局热键',
  },
]


const CONTENT: Record<string, { summary: string; features: string[] }> = {
  'https://github.com/exelban/stats': {
    summary:
      'Stats 把 CPU、内存、磁盘、网络、电池和传感器数据放进 macOS 菜单栏，点开就是实时曲线。完全开源、体积很小，适合替代 iStat Menus 这类付费监控工具。',
    features: [
      '菜单栏实时显示 CPU / 内存 / 磁盘 / 网络',
      '点击展开详细图表与占用进程',
      '支持风扇转速、电池健康与温度传感器',
      '可自定义显示模块与刷新频率',
    ],
  },
  'https://github.com/iina/iina': {
    summary:
      'IINA 是 macOS 上最接近原生体验的开源播放器，基于 mpv，几乎能播所有格式，还支持画中画、在线字幕和 Touch Bar 控制。',
    features: ['基于 mpv，格式兼容性强', '支持画中画与原生全屏', '自动匹配在线字幕', '深色模式与 Touch Bar 控制'],
  },
  'https://github.com/utmapp/UTM': {
    summary:
      'UTM 让你在 Mac、iPhone 和 iPad 上运行 Windows、Linux 甚至其他架构的系统。基于 QEMU，全程图形化配置，不需要记命令行参数。',
    features: ['图形化创建与管理虚拟机', '支持 Apple 芯片与 Intel Mac', '可模拟 x86、ARM 等多种架构', 'iPhone / iPad 上也能运行'],
  },
  'https://github.com/microsoft/PowerToys': {
    summary:
      '微软官方维护的 Windows 效率工具箱，FancyZones 窗口布局、PowerRename 批量重命名、PowerToys Run 快速启动都在里面，一次安装解决多个痛点。',
    features: ['FancyZones 自定义窗口布局', 'PowerRename 批量重命名', 'PowerToys Run 快速启动器', '取色器、快捷键冲突检测等小工具'],
  },
  'https://github.com/ShareX/ShareX': {
    summary:
      'ShareX 覆盖截图、录屏、OCR、文件上传的完整流程，截完就能自动上传并复制链接。免费开源，是 Windows 上功能最全的截图工具之一。',
    features: ['区域截图、滚动截图与录屏', '内置 OCR 与图片编辑', '自动上传图床并复制链接', '支持自定义工作流'],
  },
  'https://github.com/Flow-Launcher/Flow.Launcher': {
    summary:
      'Flow Launcher 用一个输入框替代开始菜单：搜文件、启动应用、执行命令、查网页，还能装插件扩展。启动快、内存占用低。',
    features: ['文件与应用即时搜索', '插件市场扩展能力', '自定义快捷键与主题', '可执行系统命令与脚本'],
  },
  'https://github.com/ollama/ollama': {
    summary:
      'Ollama 把本地大模型的下载、运行和 API 服务打包成一条命令。跑 Llama、Qwen、DeepSeek 都只要 ollama run，数据不出本机。',
    features: ['一条命令拉取并运行模型', '兼容 OpenAI 的本地 API', '支持 macOS / Windows / Linux', '可用 Modelfile 自定义模型'],
  },
  'https://github.com/langgenius/dify': {
    summary:
      'Dify 是开源的 LLM 应用开发平台，用可视化编排把模型、知识库、工具串成应用，再一键发布成网页或 API。',
    features: ['可视化工作流编排', '内置 RAG 知识库', '支持多种模型与工具', '可发布为 Web 应用或 API'],
  },
  'https://github.com/n8n-io/n8n': {
    summary:
      'n8n 把不同服务用节点连起来做成自动化流程。支持自托管、代码节点和 400 多个集成，很适合把 AI 接进日常工作流。',
    features: ['可视化节点编排', '400+ 服务集成', '支持 JavaScript 自定义节点', '可完全自托管'],
  },
  'https://github.com/modelcontextprotocol/servers': {
    summary:
      'MCP 官方维护的服务器集合，给 AI 提供读写文件、查询数据库、调用 API 的标准接口。想扩展 AI 能力，从这里挑一个开始。',
    features: ['官方维护的参考实现', '覆盖文件、数据库、搜索等场景', '统一的 MCP 协议接口', '可按同一规范自行扩展'],
  },
  'https://github.com/raycast/extensions': {
    summary:
      'Raycast 的官方插件仓库，上千个扩展把窗口管理、翻译、剪贴板、AI 对话塞进同一个启动器。',
    features: ['上千个社区扩展', '在启动器内直接操作', '支持自定义脚本命令', '与 macOS 深度集成'],
  },
  'https://github.com/zsviczian/obsidian-excalidraw-plugin': {
    summary:
      '在 Obsidian 里插入无限画布，画流程图、思维导图、手绘草图，并且能和笔记双向链接。',
    features: ['无限画布与手绘', '支持流程图与思维导图', '与笔记双向链接', '可导出图片与 SVG'],
  },
  'https://github.com/sharkdp/bat': {
    summary:
      'bat 是 cat 的现代替代品：语法高亮、Git 修改标记、自动分页，还能作为其他工具的语法高亮后端。',
    features: ['语法高亮与行号', '显示 Git 修改状态', '自动适配终端宽度', '可作为库被其他工具调用'],
  },
  'https://github.com/junegunn/fzf': {
    summary:
      'fzf 是命令行里的模糊搜索器，几毫秒内从几万个文件或历史记录里筛出目标，能配合 vim、git、kill 等命令使用。',
    features: ['模糊匹配，输入即筛', '可接入文件、历史与进程', '支持预览窗口', 'Vim / Shell 集成'],
  },
  'https://github.com/koekeishiya/skhd': {
    summary:
      'skhd 用一份简单的配置文件管理 macOS 全局快捷键，把窗口管理、启动应用、执行脚本绑到顺手的组合键上。',
    features: ['配置文件定义全局热键', '支持启动应用与执行脚本', '可与 yabai 配合做窗口管理', '极低资源占用'],
  },
}

export async function POST(request: NextRequest) {
  if (!process.env.SEED_SECRET || request.headers.get('x-seed-secret') !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const payload = await getPayloadClient()
  const createAny = payload.create.bind(payload) as any
  const stats = { admin: false, categories: 0, tags: 0, items: 0, collections: 0, failed: [] as string[] }

  const userCount = await payload.count({ collection: 'users' })
  if (userCount.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        email: process.env.SEED_ADMIN_EMAIL || 'admin@openshelf.local',
        password: process.env.SEED_ADMIN_PASSWORD || 'admin123456',
        name: '站长',
        role: 'admin',
      },
    })
    stats.admin = true
  }

  const categoryIds: Record<string, string | number> = {}
  for (const category of CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: category.slug } },
      limit: 1,
    })
    if (existing.docs[0]) {
      categoryIds[category.slug] = existing.docs[0].id
      continue
    }
    const doc = await payload.create({ collection: 'categories', data: category, overrideAccess: true })
    categoryIds[category.slug] = doc.id
    stats.categories += 1
  }

  for (const tag of TAGS) {
    const existing = await payload.find({ collection: 'tags', where: { slug: { equals: tag.slug } }, limit: 1 })
    if (!existing.docs[0]) {
      await createAny({ collection: 'tags', data: tag, overrideAccess: true })
      stats.tags += 1
    }
  }

  const createdItems: Array<{ id: string | number; platforms: string[]; region: string }> = []

  for (const repo of REPOS) {
    try {
      const info = await fetchRepoInfo(repo.url)
      const existing = await payload.find({
        collection: 'items',
        where: { githubFullName: { equals: info.fullName } },
        limit: 1,
      })
      if (existing.docs[0]) {
        const extra = CONTENT[repo.url]
        if (extra) {
          await payload.update({
            collection: 'items',
            id: existing.docs[0].id,
            overrideAccess: true,
            context: { skipGithub: true },
            data: {
              summary: extra.summary,
              tagline: repo.tagline || (existing.docs[0] as any).tagline,
              features: extra.features.map((text) => ({ text })),
              pricing: 'open-source',
            } as any,
          })
        }
        createdItems.push({
          id: existing.docs[0].id,
          platforms: (existing.docs[0] as any).platforms || [],
          region: repo.category,
        })
        continue
      }

      const enrich = await enrichWithAI(info)
      const platforms = repo.platforms || enrich.platforms

      const doc = await createAny({
        collection: 'items',
        overrideAccess: true,
        context: { skipGithub: true },
        data: {
          name: info.name,
          slug: slugify(info.name),
          repoUrl: info.htmlUrl,
          githubFullName: info.fullName,
          homepage: info.homepage,
          tagline: repo.tagline || enrich.tagline,
          summary: CONTENT[repo.url]?.summary || enrich.summary,
          kind: repo.kinds || enrich.kind,
          platforms,
          host: repo.host,
          category: categoryIds[repo.category],
          tagsText: enrich.tags.join(', '),
          pricing: 'open-source',
          license: info.license,
          stars: info.stars,
          forks: info.forks,
          language: info.language,
          topicsText: info.topics.join(', '),
          lastCommitAt: info.lastCommitAt || undefined,
          latestRelease: info.latestRelease,
          iconUrl: info.avatarUrl,
          coverUrl: info.coverUrl,
          installCommand: enrich.installHint,
          features: (CONTENT[repo.url]?.features || enrich.features).map((text) => ({ text })),
          status: 'published',
          featured: Boolean(repo.featured),
          editorsPick: Boolean(repo.editorsPick),
          source: 'manual',
          publishedAt: new Date().toISOString(),
          aiMeta: { generated: enrich.aiGenerated, seeded: true },
        },
      })

      createdItems.push({ id: doc.id, platforms, region: repo.category })
      stats.items += 1
    } catch (error) {
      console.error('[seed] failed', repo.url, error)
      stats.failed.push(repo.url)
    }
  }

  const listDefs = [
    {
      title: '新 Mac 必装的开源软件',
      slug: 'macos-starter',
      intro: '刚拿到 Mac，先把这几款装上也够用了。全部开源、可随时卸载。',
      pick: (item: { platforms: string[] }) => item.platforms.includes('macos'),
    },
    {
      title: 'Windows 效率清单',
      slug: 'windows-efficiency',
      intro: '从系统增强到截图录屏，把 Windows 调到顺手的状态。',
      pick: (item: { platforms: string[] }) => item.platforms.includes('windows'),
    },
    {
      title: 'AI 工具箱',
      slug: 'ai-toolbox',
      intro: '本地模型、工作流、MCP，一套能把 AI 用起来的组合。',
      pick: (item: { region: string }) => item.region === 'ai',
    },
  ]

  for (const def of listDefs) {
    const existing = await payload.find({
      collection: 'curated-lists',
      where: { slug: { equals: def.slug } },
      limit: 1,
    })
    if (existing.docs[0]) continue

    const picks = createdItems.filter(def.pick).slice(0, 8)
    if (!picks.length) continue

    await createAny({
      collection: 'curated-lists',
      overrideAccess: true,
      data: {
        title: def.title,
        slug: def.slug,
        intro: def.intro,
        status: 'published',
        sort: 10,
        publishedAt: new Date().toISOString(),
        entries: picks.map((item) => ({ item: item.id })),
      },
    })
    stats.collections += 1
  }

  return NextResponse.json({ ok: true, stats })
}
