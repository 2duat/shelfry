import type { CollectionConfig } from 'payload'
import { authenticated } from './access'

export const Submissions: CollectionConfig = {
  slug: 'submissions',
  labels: { singular: '投稿', plural: '投稿' },
  admin: {
    useAsTitle: 'repoUrl',
    group: '运营',
    defaultColumns: ['repoUrl', 'name', 'status', 'createdAt'],
    description: '前台用户提交的软件推荐，审核通过后在「软件条目」里新建',
    components: {
      beforeListTable: [
        '/components/admin/SubmissionsToolbar#SubmissionsToolbar',
        '/components/admin/EmptyListState#EmptyListState',
      ],
    },
  },
  access: {
    read: authenticated,
    create: () => false,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'repoUrl', label: 'GitHub 地址', type: 'text', required: true },
    { name: 'name', label: '名称', type: 'text' },
    { name: 'note', label: '推荐理由', type: 'textarea' },
    { name: 'contact', label: '联系方式', type: 'text' },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      defaultValue: 'pending',
      index: true,
      options: [
        { label: '待审核', value: 'pending' },
        { label: '已通过', value: 'approved' },
        { label: '已拒绝', value: 'rejected' },
      ],
    },
    { name: 'operatorNote', label: '审核备注', type: 'textarea' },
  ],
}
