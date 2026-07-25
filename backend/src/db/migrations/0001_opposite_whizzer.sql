CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`data_type` text DEFAULT 'string' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
DROP TABLE `schema_migrations`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
DROP TABLE `accounts`;