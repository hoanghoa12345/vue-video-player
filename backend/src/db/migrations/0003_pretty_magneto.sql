CREATE TABLE `categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`parent_id` integer,
	`uid` text(128),
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `channels` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`description` text,
	`user_id` integer,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `signed_urls` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`video_id` integer NOT NULL,
	`expires_at` numeric NOT NULL,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`used` integer DEFAULT false,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `video_access` (
	`id` integer PRIMARY KEY NOT NULL,
	`video_id` integer NOT NULL,
	`user_id` integer,
	`can_watch` integer DEFAULT true NOT NULL,
	`expires_at` numeric,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `video_access_unique` ON `video_access` (`video_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `video_access_user_idx` ON `video_access` (`user_id`);--> statement-breakpoint
CREATE TABLE `videos` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text(255) NOT NULL,
	`description` text,
	`asset_id` text(128) NOT NULL,
	`asset_type` text(100),
	`duration_seconds` integer,
	`size_bytes` integer,
	`thumbnail_url` text,
	`video_visibility` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`category_id` integer,
	`metadata` text,
	`user_id` integer,
	`channel_id` integer,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `videos_asset_id_unique` ON `videos` (`asset_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `videos_asset_id_idx` ON `videos` (`asset_id`);--> statement-breakpoint
CREATE INDEX `videos_category_id_idx` ON `videos` (`category_id`);--> statement-breakpoint
CREATE TABLE `watch_progress` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`video_id` integer NOT NULL,
	`position_seconds` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`last_watched_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `watch_progress_unique` ON `watch_progress` (`user_id`,`video_id`);