type ScoreInput = {
  stars?: number | null
  forks?: number | null
  lastCommitAt?: string | Date | null
  featured?: boolean | null
  editorsPick?: boolean | null
  clicks?: number | null
}

/**
 * 综合排序分：
 *  40% 星标（对数归一） + 25% 新鲜度 + 20% 编辑权重 + 15% 站内点击
 */
export function computeScore(input: ScoreInput): number {
  const stars = Math.max(0, input.stars ?? 0)
  const starScore = Math.min(1, Math.log10(stars + 1) / 5)

  let freshScore = 0.4
  if (input.lastCommitAt) {
    const date = new Date(input.lastCommitAt)
    const days = Math.max(0, (Date.now() - date.getTime()) / 86400000)
    freshScore = Math.exp(-days / 180)
  }

  const editorScore = input.editorsPick ? 1 : input.featured ? 0.6 : 0
  const clickScore = Math.min(1, Math.log10((input.clicks ?? 0) + 1) / 3)

  return Number(
    (starScore * 0.4 + freshScore * 0.25 + editorScore * 0.2 + clickScore * 0.15).toFixed(4),
  )
}
