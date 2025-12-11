import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    engine: 'classic',
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
        // vamos rodar um seed CJS direto, sem dist
        seed: 'node ./prisma/seed.cjs',
    },
    datasource: {
        url: env('DATABASE_URL'),
    },
});
