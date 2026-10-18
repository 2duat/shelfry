import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "items" ADD COLUMN "ai_enriched" boolean DEFAULT false;
  UPDATE "items" SET "ai_enriched" = true WHERE "ai_meta"->>'enrichedAt' IS NOT NULL;
  CREATE INDEX "items_ai_enriched_idx" ON "items" USING btree ("ai_enriched");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "items_ai_enriched_idx";
  ALTER TABLE "items" DROP COLUMN "ai_enriched";`)
}
