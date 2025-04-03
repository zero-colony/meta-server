import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const holders = sqliteTable("holders", {
  address: text("address").primaryKey(),
  amount: real("amount").notNull(), // Using real for float amount
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});
