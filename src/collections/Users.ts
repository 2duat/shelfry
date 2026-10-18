import type { Access, CollectionConfig } from 'payload'
import { adminOnly, authenticated, isAdmin } from './access'

const canCreateUser: Access = async ({ req }) => {
  if (isAdmin({ req })) return true
  // 首次部署允许创建第一个管理员
  const count = await req.payload.count({ collection: 'users', overrideAccess: true })
  return count.totalDocs === 0
}

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
    create: canCreateUser,
    update: adminOnly,
    delete: adminOnly,
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
