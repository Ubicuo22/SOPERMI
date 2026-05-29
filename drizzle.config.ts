import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/db/schema.ts',
	out: './drizzle/migrations',
	dbCredentials: {
		url: process.env.DB_PATH || './data/dashboard.db'
	}
});
