CREATE TABLE `account` (
	`id` text PRIMARY KEY,
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
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL UNIQUE,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	CONSTRAINT `fk_session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `agent` (
	`id` text PRIMARY KEY,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`user_id` text UNIQUE,
	`is_sakura` integer DEFAULT false NOT NULL,
	`display_name` text NOT NULL,
	`gender` text NOT NULL,
	`romantic_preference` text NOT NULL,
	`birth_date` text NOT NULL,
	`birthplace` text NOT NULL,
	`school_type` text NOT NULL,
	`club` text NOT NULL,
	`circle` text NOT NULL,
	`hobbies` text NOT NULL,
	`personality` text NOT NULL,
	`romance` text NOT NULL,
	`preference` text NOT NULL,
	`appearance` real NOT NULL,
	`joined_day` integer NOT NULL,
	CONSTRAINT `fk_agent_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `relationship` (
	`id` text PRIMARY KEY,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`source_agent_id` text NOT NULL,
	`target_agent_id` text NOT NULL,
	`attraction` real DEFAULT 0 NOT NULL,
	`trust` real DEFAULT 0 NOT NULL,
	`familiarity` real DEFAULT 0 NOT NULL,
	`chemistry` real DEFAULT 0 NOT NULL,
	`attachment` real DEFAULT 0 NOT NULL,
	`conflict` real DEFAULT 0 NOT NULL,
	`jealousy` real DEFAULT 0 NOT NULL,
	`state` text DEFAULT 'stranger' NOT NULL,
	`state_changed_day` integer NOT NULL,
	`last_interaction_day` integer,
	`interaction_streak` integer DEFAULT 0 NOT NULL,
	`liked_day` integer,
	`cooldown_until_day` integer,
	CONSTRAINT `fk_relationship_source_agent_id_agent_id_fk` FOREIGN KEY (`source_agent_id`) REFERENCES `agent`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_relationship_target_agent_id_agent_id_fk` FOREIGN KEY (`target_agent_id`) REFERENCES `agent`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `agent_event` (
	`id` text PRIMARY KEY,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`day` integer NOT NULL,
	`minute_of_day` integer NOT NULL,
	`type` text NOT NULL,
	`actor_agent_id` text NOT NULL,
	`target_agent_id` text,
	`importance` integer DEFAULT 0 NOT NULL,
	`payload` text DEFAULT '{}' NOT NULL,
	CONSTRAINT `fk_agent_event_actor_agent_id_agent_id_fk` FOREIGN KEY (`actor_agent_id`) REFERENCES `agent`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_agent_event_target_agent_id_agent_id_fk` FOREIGN KEY (`target_agent_id`) REFERENCES `agent`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `world_clock` (
	`id` text PRIMARY KEY,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`current_day` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE INDEX `agent_is_sakura_idx` ON `agent` (`is_sakura`);--> statement-breakpoint
CREATE UNIQUE INDEX `relationship_source_target_idx` ON `relationship` (`source_agent_id`,`target_agent_id`);--> statement-breakpoint
CREATE INDEX `relationship_target_idx` ON `relationship` (`target_agent_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `relationship_one_partner_idx` ON `relationship` (`source_agent_id`) WHERE state in ('dating', 'partner');--> statement-breakpoint
CREATE INDEX `agent_event_actor_day_idx` ON `agent_event` (`actor_agent_id`,`day`);--> statement-breakpoint
CREATE INDEX `agent_event_target_day_idx` ON `agent_event` (`target_agent_id`,`day`);--> statement-breakpoint
CREATE INDEX `agent_event_day_importance_idx` ON `agent_event` (`day`,`importance`);