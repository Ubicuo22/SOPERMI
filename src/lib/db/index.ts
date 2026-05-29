import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';

const dbPath = process.env.DB_PATH || './data/dashboard.db';

const dir = dirname(dbPath);
if (!existsSync(dir)) {
	mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const hasTable = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='categories'").get();
if (!hasTable) {
	const schemaPath = resolve('SCHEMA.sql');
	if (existsSync(schemaPath)) {
		const sql = readFileSync(schemaPath, 'utf-8');
		sqlite.exec(sql);
	}
}

export const db = drizzle(sqlite, { schema });
export { schema };
