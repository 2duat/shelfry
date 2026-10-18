import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "items_github_full_name_idx";
  CREATE INDEX "items_published_at_idx" ON "items" USING btree ("published_at");
  CREATE INDEX "items_stars_idx" ON "items" USING btree ("stars");
  CREATE INDEX "items_score_idx" ON "items" USING btree ("score");
  CREATE UNIQUE INDEX "items_github_full_name_idx" ON "items" USING btree ("github_full_name");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "items_published_at_idx";
  DROP INDEX "items_stars_idx";
  DROP INDEX "items_score_idx";
  DROP INDEX "items_github_full_name_idx";
  CREATE INDEX "items_github_full_name_idx" ON "items" USING btree ("github_full_name");`)
}
