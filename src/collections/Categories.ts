import type { CollectionConfig } from 'payload'
import { slugify } from '../lib/slug'
import { anyone, authenticated } from './access'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: '分类', plural: '分类' },
  admin: {
    useAsTitle: 'name',
    group: '内容',
    defaultColumns: ['name', 'slug', 'sort'],
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
    { name: 'icon', label: '图标名', type: 'text', admin: { description: 'lucide 图标名，如 Palette、Terminal' } },
    { name: 'description', label: '分类介绍', type: 'textarea' },
    {
      name: 'parent',
      label: '上级分类',
      type: 'relationship',
      relationTo: 'categories',
    },
    { name: 'sort', label: '排序', type: 'number', defaultValue: 100 },
    { name: 'featured', label: '首页展示', type: 'checkbox', defaultValue: false },
  ],
}
