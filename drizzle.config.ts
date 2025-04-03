import type { Config } from "drizzle-kit";

export default {
  schema: "./src/services/holders/db/schema/schema.ts",
  out: "./drizzle",
  driver: "better-sqlite",
  verbose: true,
} satisfies Config;
