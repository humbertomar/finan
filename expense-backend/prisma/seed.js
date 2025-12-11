import pkg from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const { PrismaClient } = pkg;

// Conexão do adapter PG
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Adapter do Prisma 7
const adapter = new PrismaPg(pool);

// Instância do Prisma
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Iniciando seed...');

    const passwordBetim = await bcrypt.hash('betim123', 10);
    const passwordLidy = await bcrypt.hash('lidy123', 10);

    await prisma.user.upsert({
        where: { email: 'betim@contas.com.br' },
        update: {},
        create: {
            email: 'betim@contas.com.br',
            password: passwordBetim,
            name: 'Betim',
        },
    });

    await prisma.user.upsert({
        where: { email: 'lidy@contas.com.br' },
        update: {},
        create: {
            email: 'lidy@contas.com.br',
            password: passwordLidy,
            name: 'Lidy',
        },
    });

    console.log('✔️ Seed finalizado com sucesso!');
}

// Execução do seed
main()
    .catch((err) => {
        console.error('❌ Erro no seed:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
