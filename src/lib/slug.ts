export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/['"’]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

  return base || `item-${Date.now().toString(36)}`
}

export function repoSlug(owner: string, repo: string): string {
  return slugify(`${repo}`)
}
