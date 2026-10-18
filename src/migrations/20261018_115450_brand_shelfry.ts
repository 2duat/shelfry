import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" ALTER COLUMN "site_name" SET DEFAULT 'Shelfry';
   UPDATE "settings" SET "site_name" = 'Shelfry' WHERE "site_name" = 'OpenShelf';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" ALTER COLUMN "site_name" SET DEFAULT 'OpenShelf';
   UPDATE "settings" SET "site_name" = 'OpenShelf' WHERE "site_name" = 'Shelfry';`)
}
