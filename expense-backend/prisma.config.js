// prisma.config.js
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    engine: 'classic',
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
        // 👉 AQUI é o seed que queremos rodar
        seed: 'node ./prisma/seed.cjs',
    },
    datasource: {
        url: env('DATABASE_URL'),
    },
});
