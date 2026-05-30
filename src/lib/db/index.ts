import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';

const root = process.cwd();
const dbPath = process.env.DB_PATH || join(root, 'data', 'dashboard.db');

const dir = dirname(dbPath);
if (!existsSync(dir)) {
	mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const hasTable = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='categories'").get();
if (!hasTable) {
	const schemaPath = join(root, 'SCHEMA.sql');
	if (existsSync(schemaPath)) {
		const sqlContent = readFileSync(schemaPath, 'utf-8');
		sqlite.exec(sqlContent);
	}
}

export const db = drizzle(sqlite, { schema });
export { schema };
