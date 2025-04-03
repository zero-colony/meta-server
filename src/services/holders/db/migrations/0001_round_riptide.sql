PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_holders` (
	`address` text PRIMARY KEY NOT NULL,
	`amount` real NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_holders`("address", "amount", "updated_at") SELECT "address", "amount", "updated_at" FROM `holders`;--> statement-breakpoint
DROP TABLE `holders`;--> statement-breakpoint
ALTER TABLE `__new_holders` RENAME TO `holders`;--> statement-breakpoint
PRAGMA foreign_keys=ON;