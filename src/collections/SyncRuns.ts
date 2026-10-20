import type { CollectionConfig } from 'payload'
import { authenticated } from './access'

export const SyncRuns: CollectionConfig = {
  slug: 'sync-runs',
  labels: { singular: '同步记录', plural: '同步记录' },
  admin: {
    useAsTitle: 'id',
    group: '运营',
    defaultColumns: ['type', 'status', 'trigger', 'startedAt', 'finishedAt'],
    components: {
      beforeListTable: ['/components/admin/EmptyListState#EmptyListState'],
    },
    description: '定时任务与手动导入的执行记录',
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'type',
      label: '类型',
      type: 'select',
      options: [
        { label: '刷新星标', value: 'refresh' },
        { label: '自动发现', value: 'discover' },
        { label: 'AI 补全', value: 'enrich' },
        { label: 'README 补全', value: 'readme' },
        { label: '标签补全', value: 'tags' },
        { label: '单条导入', value: 'import' },
        { label: '初始化', value: 'seed' },
      ],
    },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      defaultValue: 'running',
      options: [
        { label: '运行中', value: 'running' },
        { label: '成功', value: 'success' },
        { label: '失败', value: 'failed' },
      ],
    },
    { name: 'trigger', label: '触发方式', type: 'text', defaultValue: 'cron' },
    { name: 'startedAt', label: '开始时间', type: 'date' },
    { name: 'finishedAt', label: '结束时间', type: 'date' },
    { name: 'stats', label: '统计', type: 'json' },
    { name: 'message', label: '说明', type: 'textarea' },
  ],
}
