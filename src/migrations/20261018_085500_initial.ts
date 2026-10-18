import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_items_platforms" AS ENUM('macos', 'windows', 'linux', 'web', 'ios', 'android');
  CREATE TYPE "public"."enum_items_kind" AS ENUM('app', 'cli', 'plugin', 'ai-tool', 'ai-skill', 'mcp-server', 'prompt', 'workflow');
  CREATE TYPE "public"."enum_items_host" AS ENUM('vscode', 'obsidian', 'chrome', 'raycast', 'figma', 'cursor', 'claude', 'n8n', 'other');
  CREATE TYPE "public"."enum_items_pricing" AS ENUM('open-source', 'free', 'freemium', 'paid');
  CREATE TYPE "public"."enum_items_source" AS ENUM('manual', 'discovery', 'awesome', 'submission');
  CREATE TYPE "public"."enum_items_status" AS ENUM('draft', 'published', 'hidden');
  CREATE TYPE "public"."enum_tags_group" AS ENUM('topic', 'scene', 'tech');
  CREATE TYPE "public"."enum_curated_lists_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_submissions_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_sync_runs_type" AS ENUM('refresh', 'discover', 'enrich', 'import', 'seed');
  CREATE TYPE "public"."enum_sync_runs_status" AS ENUM('running', 'success', 'failed');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TABLE "items_platforms" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_items_platforms",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "items_screenshots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "items_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"repo_url" varchar,
  	"sync_now" boolean DEFAULT false,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"tagline" varchar,
  	"summary" varchar,
  	"kind" "enum_items_kind" DEFAULT 'app',
  	"host" "enum_items_host",
  	"category_id" integer,
  	"tags_text" varchar,
  	"pricing" "enum_items_pricing" DEFAULT 'open-source',
  	"license" varchar,
  	"homepage" varchar,
  	"download_url" varchar,
  	"install_command" varchar,
  	"icon_url" varchar,
  	"cover_url" varchar,
  	"body" jsonb,
  	"audience" varchar,
  	"github_full_name" varchar,
  	"stars" numeric,
  	"forks" numeric,
  	"language" varchar,
  	"topics_text" varchar,
  	"last_commit_at" timestamp(3) with time zone,
  	"latest_release" varchar,
  	"archived" boolean,
  	"last_synced_at" timestamp(3) with time zone,
  	"source" "enum_items_source" DEFAULT 'manual',
  	"ai_meta" jsonb,
  	"status" "enum_items_status" DEFAULT 'draft' NOT NULL,
  	"featured" boolean DEFAULT false,
  	"editors_pick" boolean DEFAULT false,
  	"score" numeric,
  	"published_at" timestamp(3) with time zone,
  	"clicks" numeric DEFAULT 0,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"search_text" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "items_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"icon" varchar,
  	"description" varchar,
  	"parent_id" integer,
  	"sort" numeric DEFAULT 100,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"group" "enum_tags_group" DEFAULT 'topic',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "curated_lists_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item_id" integer NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "curated_lists" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"intro" varchar,
  	"cover" varchar,
  	"sort" numeric DEFAULT 100,
  	"status" "enum_curated_lists_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"repo_url" varchar NOT NULL,
  	"name" varchar,
  	"note" varchar,
  	"contact" varchar,
  	"status" "enum_submissions_status" DEFAULT 'pending',
  	"operator_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sync_runs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_sync_runs_type",
  	"status" "enum_sync_runs_status" DEFAULT 'running',
  	"trigger" varchar DEFAULT 'cron',
  	"started_at" timestamp(3) with time zone,
  	"finished_at" timestamp(3) with time zone,
  	"stats" jsonb,
  	"message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"credit" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_cover_url" varchar,
  	"sizes_cover_width" numeric,
  	"sizes_cover_height" numeric,
  	"sizes_cover_mime_type" varchar,
  	"sizes_cover_filesize" numeric,
  	"sizes_cover_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'admin',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"items_id" integer,
  	"categories_id" integer,
  	"tags_id" integer,
  	"curated_lists_id" integer,
  	"submissions_id" integer,
  	"sync_runs_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "settings_discovery_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"query" varchar NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"default_kind" varchar DEFAULT 'app'
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'OpenShelf',
  	"tagline" varchar DEFAULT '精选开源软件与 AI 工具',
  	"description" varchar,
  	"hero_title" varchar DEFAULT '发现真正好用的开源软件',
  	"hero_subtitle" varchar DEFAULT 'macOS、Windows、AI 工具与插件，人工精选 + GitHub 自动同步，每一个都附安装方式与真实评价。',
  	"email" varchar,
  	"github_url" varchar,
  	"icp" varchar,
  	"footer_note" varchar,
  	"github_token" varchar,
  	"llm_base_url" varchar,
  	"llm_api_key" varchar,
  	"llm_model" varchar,
  	"auto_publish" boolean DEFAULT false,
  	"auto_publish_stars" numeric DEFAULT 800,
  	"refresh_limit" numeric DEFAULT 30,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "items_platforms" ADD CONSTRAINT "items_platforms_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "items_screenshots" ADD CONSTRAINT "items_screenshots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "items_features" ADD CONSTRAINT "items_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "items" ADD CONSTRAINT "items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "items_rels" ADD CONSTRAINT "items_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "items_rels" ADD CONSTRAINT "items_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "curated_lists_entries" ADD CONSTRAINT "curated_lists_entries_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "curated_lists_entries" ADD CONSTRAINT "curated_lists_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."curated_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_items_fk" FOREIGN KEY ("items_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_curated_lists_fk" FOREIGN KEY ("curated_lists_id") REFERENCES "public"."curated_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_submissions_fk" FOREIGN KEY ("submissions_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sync_runs_fk" FOREIGN KEY ("sync_runs_id") REFERENCES "public"."sync_runs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_discovery_rules" ADD CONSTRAINT "settings_discovery_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "items_platforms_order_idx" ON "items_platforms" USING btree ("order");
  CREATE INDEX "items_platforms_parent_idx" ON "items_platforms" USING btree ("parent_id");
  CREATE INDEX "items_screenshots_order_idx" ON "items_screenshots" USING btree ("_order");
  CREATE INDEX "items_screenshots_parent_id_idx" ON "items_screenshots" USING btree ("_parent_id");
  CREATE INDEX "items_features_order_idx" ON "items_features" USING btree ("_order");
  CREATE INDEX "items_features_parent_id_idx" ON "items_features" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "items_slug_idx" ON "items" USING btree ("slug");
  CREATE INDEX "items_category_idx" ON "items" USING btree ("category_id");
  CREATE INDEX "items_github_full_name_idx" ON "items" USING btree ("github_full_name");
  CREATE INDEX "items_status_idx" ON "items" USING btree ("status");
  CREATE INDEX "items_search_text_idx" ON "items" USING btree ("search_text");
  CREATE INDEX "items_updated_at_idx" ON "items" USING btree ("updated_at");
  CREATE INDEX "items_created_at_idx" ON "items" USING btree ("created_at");
  CREATE INDEX "items_rels_order_idx" ON "items_rels" USING btree ("order");
  CREATE INDEX "items_rels_parent_idx" ON "items_rels" USING btree ("parent_id");
  CREATE INDEX "items_rels_path_idx" ON "items_rels" USING btree ("path");
  CREATE INDEX "items_rels_tags_id_idx" ON "items_rels" USING btree ("tags_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "curated_lists_entries_order_idx" ON "curated_lists_entries" USING btree ("_order");
  CREATE INDEX "curated_lists_entries_parent_id_idx" ON "curated_lists_entries" USING btree ("_parent_id");
  CREATE INDEX "curated_lists_entries_item_idx" ON "curated_lists_entries" USING btree ("item_id");
  CREATE UNIQUE INDEX "curated_lists_slug_idx" ON "curated_lists" USING btree ("slug");
  CREATE INDEX "curated_lists_status_idx" ON "curated_lists" USING btree ("status");
  CREATE INDEX "curated_lists_updated_at_idx" ON "curated_lists" USING btree ("updated_at");
  CREATE INDEX "curated_lists_created_at_idx" ON "curated_lists" USING btree ("created_at");
  CREATE INDEX "submissions_status_idx" ON "submissions" USING btree ("status");
  CREATE INDEX "submissions_updated_at_idx" ON "submissions" USING btree ("updated_at");
  CREATE INDEX "submissions_created_at_idx" ON "submissions" USING btree ("created_at");
  CREATE INDEX "sync_runs_updated_at_idx" ON "sync_runs" USING btree ("updated_at");
  CREATE INDEX "sync_runs_created_at_idx" ON "sync_runs" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_cover_sizes_cover_filename_idx" ON "media" USING btree ("sizes_cover_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_items_id_idx" ON "payload_locked_documents_rels" USING btree ("items_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_curated_lists_id_idx" ON "payload_locked_documents_rels" USING btree ("curated_lists_id");
  CREATE INDEX "payload_locked_documents_rels_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("submissions_id");
  CREATE INDEX "payload_locked_documents_rels_sync_runs_id_idx" ON "payload_locked_documents_rels" USING btree ("sync_runs_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "settings_discovery_rules_order_idx" ON "settings_discovery_rules" USING btree ("_order");
  CREATE INDEX "settings_discovery_rules_parent_id_idx" ON "settings_discovery_rules" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "items_platforms" CASCADE;
  DROP TABLE "items_screenshots" CASCADE;
  DROP TABLE "items_features" CASCADE;
  DROP TABLE "items" CASCADE;
  DROP TABLE "items_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "curated_lists_entries" CASCADE;
  DROP TABLE "curated_lists" CASCADE;
  DROP TABLE "submissions" CASCADE;
  DROP TABLE "sync_runs" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "settings_discovery_rules" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TYPE "public"."enum_items_platforms";
  DROP TYPE "public"."enum_items_kind";
  DROP TYPE "public"."enum_items_host";
  DROP TYPE "public"."enum_items_pricing";
  DROP TYPE "public"."enum_items_source";
  DROP TYPE "public"."enum_items_status";
  DROP TYPE "public"."enum_tags_group";
  DROP TYPE "public"."enum_curated_lists_status";
  DROP TYPE "public"."enum_submissions_status";
  DROP TYPE "public"."enum_sync_runs_type";
  DROP TYPE "public"."enum_sync_runs_status";
  DROP TYPE "public"."enum_users_role";`)
}
