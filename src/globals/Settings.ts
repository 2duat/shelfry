import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../collections/access'

const adminRead = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: '站点设置',
  access: {
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '站点信息',
          fields: [
            { name: 'siteName', label: '站点名称', type: 'text', defaultValue: 'Shelfry' },
            { name: 'tagline', label: '副标题', type: 'text', defaultValue: '精选开源软件与 AI 工具' },
            { name: 'description', label: '站点描述', type: 'textarea' },
            { name: 'heroTitle', label: '首页大标题', type: 'text', defaultValue: '发现真正好用的开源软件' },
            {
              name: 'heroSubtitle',
              label: '首页副标题',
              type: 'textarea',
              defaultValue:
                'macOS、Windows、AI 工具与插件，人工精选 + GitHub 自动同步，每一个都附安装方式与真实评价。',
            },
            { name: 'email', label: '联系邮箱', type: 'text' },
            { name: 'githubUrl', label: 'GitHub 主页', type: 'text' },
            { name: 'icp', label: '备案号', type: 'text' },
            { name: 'footerNote', label: '页脚说明', type: 'textarea' },
          ],
        },
        {
          label: '采集与 AI',
          fields: [
            {
              name: 'githubToken',
              label: 'GitHub Token',
              type: 'text',
              access: { read: adminRead },
              admin: {
                description: '只读 Token 即可，不填每天只能请求 60 次。保存后重启服务生效。',
              },
            },
            {
              name: 'llmBaseUrl',
              label: 'LLM 接口地址',
              type: 'text',
              access: { read: adminRead },
              admin: { description: '例如 https://api.deepseek.com/v1' },
            },
            {
              name: 'llmApiKey',
              label: 'LLM API Key',
              type: 'text',
              access: { read: adminRead },
            },
            { name: 'llmModel', label: 'LLM 模型', type: 'text', access: { read: adminRead } },
            {
              name: 'autoPublish',
              label: '自动发布',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: '开启后，自动发现且 Stars 超过阈值的仓库直接发布，否则进草稿' },
            },
            { name: 'autoPublishStars', label: '自动发布星标阈值', type: 'number', defaultValue: 800 },
            {
              name: 'discoveryRules',
              label: '自动发现规则',
              type: 'array',
              admin: { description: 'GitHub 搜索语法，例如 topic:macos-app stars:>800 pushed:>2025-01-01' },
              fields: [
                { name: 'query', label: '搜索语句', type: 'text', required: true },
                { name: 'enabled', label: '启用', type: 'checkbox', defaultValue: true },
                { name: 'defaultKind', label: '默认类型', type: 'text', defaultValue: 'app' },
              ],
            },
            { name: 'refreshLimit', label: '每次刷新条数', type: 'number', defaultValue: 30 },
          ],
        },
      ],
    },
  ],
}
