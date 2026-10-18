import type { CollectionConfig } from 'payload'
import { authenticated } from './access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: '管理员', plural: '管理员' },
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: '系统',
    defaultColumns: ['email', 'name', 'role'],
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'name', label: '昵称', type: 'text' },
    {
      name: 'role',
      label: '角色',
      type: 'select',
      defaultValue: 'admin',
      options: [
        { label: '管理员', value: 'admin' },
        { label: '编辑', value: 'editor' },
      ],
    },
  ],
}
