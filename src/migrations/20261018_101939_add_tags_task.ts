import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_sync_runs_type" ADD VALUE 'tags' BEFORE 'import';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sync_runs" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_sync_runs_type";
  CREATE TYPE "public"."enum_sync_runs_type" AS ENUM('refresh', 'discover', 'enrich', 'readme', 'import', 'seed');
  ALTER TABLE "sync_runs" ALTER COLUMN "type" SET DATA TYPE "public"."enum_sync_runs_type" USING "type"::"public"."enum_sync_runs_type";`)
}
