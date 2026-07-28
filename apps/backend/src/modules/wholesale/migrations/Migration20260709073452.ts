import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260709073452 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "wholesale_application" ("id" text not null, "customer_id" text not null, "email" text not null, "company_name" text not null, "contact_name" text null, "phone" text null, "expected_volume" text null, "note" text null, "status" text check ("status" in ('pending', 'approved', 'rejected')) not null default 'pending', "reviewed_by" text null, "reviewed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "wholesale_application_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_wholesale_application_deleted_at" ON "wholesale_application" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "wholesale_application" cascade;`);
  }

}
