import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * 早期版本即使 AI 调用失败也会写入 enrichedAt，导致之后永远不再重试。
 * 这里把「AI 没有真正生成内容」的条目标记回未补全，并清掉退避时间，
 * 让新版 enrich 重新抓 README、功能点、标签和平台。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "items"
    SET "ai_enriched" = false,
        "ai_meta" = CASE
          WHEN "ai_meta" IS NULL THEN NULL
          ELSE "ai_meta" - 'lastAttemptAt'
        END
    WHERE "ai_meta"->>'generated' IS DISTINCT FROM 'true';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // 数据修正，不需要回滚
}
