export const PLATFORMS = [
  { value: 'macos', label: 'macOS', icon: 'Apple' },
  { value: 'windows', label: 'Windows', icon: 'Monitor' },
  { value: 'linux', label: 'Linux', icon: 'Terminal' },
  { value: 'web', label: 'Web', icon: 'Globe' },
  { value: 'ios', label: 'iOS', icon: 'Smartphone' },
  { value: 'android', label: 'Android', icon: 'TabletSmartphone' },
] as const

export const KINDS = [
  { value: 'app', label: '应用', desc: '可以直接安装使用的桌面软件' },
  { value: 'cli', label: '命令行工具', desc: '终端里运行的效率工具' },
  { value: 'plugin', label: '插件 / 扩展', desc: '寄生在其他软件里的增强' },
  { value: 'ai-tool', label: 'AI 工具', desc: '独立的 AI 产品与本地推理工具' },
  { value: 'ai-skill', label: 'AI 技能', desc: 'Agent Skills、提示词包、规则集' },
  { value: 'mcp-server', label: 'MCP Server', desc: '给 AI 提供工具能力' },
  { value: 'prompt', label: '提示词', desc: '可直接复用的 Prompt' },
  { value: 'workflow', label: '工作流', desc: '自动化编排与模板' },
] as const

export const PRICINGS = [
  { value: 'open-source', label: '完全开源' },
  { value: 'free', label: '免费' },
  { value: 'freemium', label: '免费增值' },
  { value: 'paid', label: '付费' },
] as const

export const HOSTS = [
  { value: 'vscode', label: 'VS Code' },
  { value: 'obsidian', label: 'Obsidian' },
  { value: 'chrome', label: 'Chrome' },
  { value: 'raycast', label: 'Raycast' },
  { value: 'figma', label: 'Figma' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'claude', label: 'Claude' },
  { value: 'n8n', label: 'n8n' },
  { value: 'other', label: '其他' },
] as const

export const STATUSES = [
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'hidden', label: '已隐藏' },
] as const

export const SORTS = [
  { value: 'recommended', label: '推荐' },
  { value: 'newest', label: '最新收录' },
  { value: 'stars', label: '星标最多' },
  { value: 'updated', label: '最近更新' },
] as const

export type PlatformValue = (typeof PLATFORMS)[number]['value']
export type KindValue = (typeof KINDS)[number]['value']

export function labelOf(
  list: ReadonlyArray<{ value: string; label: string }>,
  value: string | null | undefined,
): string {
  if (!value) return ''
  return list.find((i) => i.value === value)?.label ?? value
}

export function platformMeta(value: string) {
  return PLATFORMS.find((p) => p.value === value)
}

export const PLATFORM_PAGES = [
  {
    slug: 'macos',
    title: 'macOS 开源软件',
    subtitle: '为 Mac 挑的、真正好用的开源应用与命令行工具。',
    platform: 'macos' as const,
  },
  {
    slug: 'windows',
    title: 'Windows 开源软件',
    subtitle: 'Windows 上值得安装的开源工具，覆盖效率、开发与系统增强。',
    platform: 'windows' as const,
  },
  {
    slug: 'ai',
    title: 'AI 工具与技能',
    subtitle: 'AI 应用、MCP Server、Agent 技能与提示词，持续更新。',
    platform: undefined,
  },
  {
    slug: 'plugins',
    title: '插件与扩展',
    subtitle: 'VS Code、Obsidian、Chrome、Raycast 上的效率增强。',
    platform: undefined,
  },
] as const
