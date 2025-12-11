import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    engine: 'classic',

    schema: 'prisma/schema.prisma',

    migrations: {
        path: 'prisma/migrations',
        // IMPORTANTE: roda o seed COMPILADO no dist
        seed: 'node ./dist/prisma/seed.js',
    },

    datasource: {
        url: env('DATABASE_URL'),
    },
});
