import type { CollectionConfig } from 'payload'
import { slugify } from '../lib/slug'
import { authenticated, publishedOrAuthenticated } from './access'

export const CuratedLists: CollectionConfig = {
  slug: 'curated-lists',
  labels: { singular: '合集', plural: '合集' },
  admin: {
    useAsTitle: 'title',
    group: '内容',
    defaultColumns: ['title', 'status', 'sort', 'updatedAt'],
    components: {
      beforeListTable: ['/components/admin/EmptyListState#EmptyListState'],
    },
    description: '编辑策展的清单，例如「新 Mac 必装 30 款」',
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.title) data.slug = slugify(String(data.title))
        return data
      },
    ],
  },
  fields: [
    { name: 'title', label: '标题', type: 'text', required: true },
    { name: 'slug', label: 'URL 标识', type: 'text', unique: true, index: true },
    { name: 'intro', label: '导语', type: 'textarea' },
    { name: 'cover', label: '封面图', type: 'text' },
    { name: 'sort', label: '排序', type: 'number', defaultValue: 100 },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: [
        { label: '草稿', value: 'draft' },
        { label: '已发布', value: 'published' },
      ],
    },
    { name: 'publishedAt', label: '发布时间', type: 'date' },
    {
      name: 'entries',
      label: '条目',
      type: 'array',
      fields: [
        { name: 'item', label: '软件', type: 'relationship', relationTo: 'items', required: true },
        { name: 'note', label: '推荐语', type: 'text' },
      ],
    },
  ],
}
