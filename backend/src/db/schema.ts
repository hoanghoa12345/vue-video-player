import { relations, sql } from "drizzle-orm";
import {
  integer,
  numeric,
  sqliteTable,
  text,
  uniqueIndex,
  index,
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

export const channels = sqliteTable("channels", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  name: text("name", { length: 255 }).notNull(),
  description: text("description"),
  avatarImage: text("avatar_image"),
  coverImage: text("cover_image"),
  userId: text("user_id").references(() => users.id),
  createdAt: numeric("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const videos = sqliteTable(
  "videos",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID())
      .notNull(),
    title: text("title", { length: 255 }).notNull(),
    description: text("description"),
    assetId: text("asset_id", { length: 128 }).notNull().unique(),
    assetType: text("asset_type", { length: 100 }),
    durationSeconds: integer("duration_seconds"),
    sizeBytes: integer("size_bytes"),
    thumbnailUrl: text("thumbnail_url"),
    videoVisibility: integer("video_visibility"),
    isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
    categoryId: text("category_id").references(() => categories.id),
    metadata: text("metadata"),
    userId: text("user_id").references(() => users.id),
    channelId: text("channel_id").references(() => channels.id),
    createdAt: numeric("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: numeric("updated_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (t) => [
    uniqueIndex("videos_asset_id_idx").on(t.assetId),
    index("videos_category_id_idx").on(t.categoryId),
  ]
);

export const categories = sqliteTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  name: text("name", { length: 255 }).notNull(),
  parentId: text("parent_id"),
  uId: text("uid", { length: 128 }),
  createdAt: numeric("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const videoAccess = sqliteTable(
  "video_access",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID())
      .notNull(),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    canWatch: integer("can_watch", { mode: "boolean" }).default(true).notNull(),
    expiresAt: numeric("expires_at"),
    createdAt: numeric("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (t) => [
    uniqueIndex("video_access_unique").on(t.videoId, t.userId),
    index("video_access_user_idx").on(t.userId),
  ]
);

export const watchProgress = sqliteTable(
  "watch_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    positionSeconds: integer("position_seconds").default(0).notNull(),
    completed: integer("completed", { mode: "boolean" })
      .default(false)
      .notNull(),
    lastWatchedAt: numeric("last_watched_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (t) => [uniqueIndex("watch_progress_unique").on(t.userId, t.videoId)]
);

export const signedUrls = sqliteTable("signed_urls", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  videoId: text("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  expiresAt: numeric("expires_at").notNull(),
  createdAt: numeric("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  used: integer("used", { mode: "boolean" }).default(false),
  thumbnailUrl: text("thumbnail_url"),
  signedVideoUrl: text("signed_video_url"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  access: many(videoAccess),
  progress: many(watchProgress),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
  access: many(videoAccess),
  progress: many(watchProgress),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// Types
export type SelectSetting = typeof settingsTable.$inferSelect;
export type InsertSetting = typeof settingsTable.$inferInsert;

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type SelectAccount = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;
