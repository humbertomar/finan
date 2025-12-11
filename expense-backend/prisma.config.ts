// prisma.config.ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export default defineConfig({
    engine: 'classic',

    schema: 'prisma/schema.prisma',

    migrations: {
        path: 'prisma/migrations',
        seed: 'node ./prisma/seed.js',
    },

    datasource: {
        url: env('DATABASE_URL'),
    },
}); 
