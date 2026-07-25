-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `schema_migrations` (
	`version` numeric,
	`dirty` numeric
);
--> statement-breakpoint
CREATE UNIQUE INDEX `version_unique` ON `schema_migrations` (`version`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT 'false' NOT NULL,
	`image` text,
	`created_at` numeric DEFAULT (current_timestamp) NOT NULL,
	`updated_at` numeric DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` numeric,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_id_unique` ON `accounts` (`id`);
*/