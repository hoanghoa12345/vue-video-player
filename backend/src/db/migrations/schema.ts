import { sqliteTable, AnySQLiteColumn, uniqueIndex, numeric, text, integer, foreignKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const schemaMigrations = sqliteTable("schema_migrations", {
	version: numeric(),
	dirty: numeric(),
},
(table) => [
	uniqueIndex("version_unique").on(table.version),
]);

export const users = sqliteTable("users", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: integer("email_verified").default(false).notNull(),
	image: text(),
	createdAt: numeric("created_at").default(sql`(current_timestamp)`).notNull(),
	updatedAt: numeric("updated_at").default(sql`(current_timestamp)`).notNull(),
},
(table) => [
	uniqueIndex("user_id_unique").on(table.id),
	uniqueIndex("user_email_unique").on(table.email),
]);

export const accounts = sqliteTable("accounts", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at"),
	refreshTokenExpiresAt: integer("refresh_token_expires_at"),
	scope: text(),
	password: text(),
	createdAt: numeric("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: numeric("updated_at"),
},
(table) => [
	uniqueIndex("account_id_unique").on(table.id),
]);

