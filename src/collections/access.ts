import type { Access } from 'payload'

export const anyone: Access = () => true

export const authenticated: Access = ({ req }) => Boolean(req.user)

/** 游客只能读已发布内容，登录用户可读全部 */
export const publishedOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true
  return { status: { equals: 'published' } }
}

export const adminOnly: Access = ({ req }) => {
  const user = req.user as { role?: string } | null
  return user?.role === 'admin'
}
