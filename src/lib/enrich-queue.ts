import { enrichItem } from './enrich-item'
import type { IntegrationConfig } from './integrations'

type PayloadLike = any

const queue = new Set<string | number>()
let running = false

/**
 * 后台补全队列：按顺序处理，不阻塞后台请求。
 * 失败/进程重启时，计划任务里的 enrich 会继续兜底。
 */
export function enqueueEnrich(
  payload: PayloadLike,
  ids: Array<string | number>,
  integration: IntegrationConfig,
): number {
  for (const id of ids) queue.add(id)
  const pending = queue.size
  if (!running) void drain(payload, integration)
  return pending
}

async function drain(payload: PayloadLike, integration: IntegrationConfig) {
  running = true
  try {
    while (queue.size) {
      const id = queue.values().next().value as string | number
      queue.delete(id)
      try {
        const item = await payload.findByID({
          collection: 'items',
          id,
          depth: 0,
          overrideAccess: true,
        })
        if (!item?.repoUrl || item.aiEnriched) continue

        const lastAttempt = item.aiMeta?.lastAttemptAt
          ? new Date(item.aiMeta.lastAttemptAt).getTime()
          : 0
        if (lastAttempt && Date.now() - lastAttempt < 24 * 60 * 60 * 1000) continue

        await enrichItem(payload, item, integration)
        console.log('[enrich-queue] enriched', id)
      } catch (error) {
        console.error('[enrich-queue] failed', id, String(error))
      }
    }
  } finally {
    running = false
  }
}
