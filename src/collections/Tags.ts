import type { CollectionConfig } from 'payload'
import { slugify } from '../lib/slug'
import { anyone, authenticated } from './access'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: '标签', plural: '标签' },
  admin: {
    useAsTitle: 'name',
    group: '内容',
    defaultColumns: ['name', 'slug', 'group'],
    components: {
      beforeListTable: ['/components/admin/EmptyListState#EmptyListState'],
    },
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.name) data.slug = slugify(String(data.name))
        return data
      },
    ],
  },
  fields: [
    { name: 'name', label: '名称', type: 'text', required: true },
    { name: 'slug', label: 'URL 标识', type: 'text', required: true, unique: true, index: true },
    {
      name: 'group',
      label: '分组',
      type: 'select',
      defaultValue: 'topic',
      options: [
        { label: '主题', value: 'topic' },
        { label: '场景', value: 'scene' },
        { label: '技术', value: 'tech' },
      ],
    },
  ],
}
