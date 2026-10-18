import path from 'path'
import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from './access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: '媒体', plural: '媒体库' },
  admin: {
    group: '系统',
    description: '上传的图标与截图，保存到站点 uploads/ 目录',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'uploads'),
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 800 },
      { name: 'cover', width: 1600 },
    ],
  },
  fields: [
    { name: 'alt', label: '替代文字', type: 'text' },
    { name: 'credit', label: '来源说明', type: 'text' },
  ],
}
