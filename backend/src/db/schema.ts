import { relations, sql } from "drizzle-orm";
import {
  integer,
  numeric,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: integer("email_verified").default(0).notNull(),
    image: text(),
    createdAt: numeric("created_at")
      .default(sql`(current_timestamp)`)
      .notNull(),
    updatedAt: numeric("updated_at")
      .default(sql`(current_timestamp)`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_id_unique").on(table.id),
    uniqueIndex("user_email_unique").on(table.email),
  ]
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: text().primaryKey().notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at"),
    refreshTokenExpiresAt: integer("refresh_token_expires_at"),
    scope: text(),
    password: text(),
    createdAt: numeric("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: numeric("updated_at"),
  },
  (table) => [uniqueIndex("account_id_unique").on(table.id)]
);

export const settingsTable = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  description: text("description"),
  dataType: text("data_type")
    .$type<"string" | "number" | "boolean" | "json">()
    .notNull()
    .default("string"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date()
  ),
});

// Relations
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

// Types
export type SelectSetting = typeof settingsTable.$inferSelect;
export type InsertSetting = typeof settingsTable.$inferInsert;

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type SelectAccount = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;
