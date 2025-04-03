import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema/schema";
import path from "path";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });

// For development: Enable SQLite foreign keys
sqlite.pragma("foreign_keys = ON");
