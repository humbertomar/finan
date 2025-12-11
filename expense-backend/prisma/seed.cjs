// prisma/seed.cjs
const { PrismaClient } = require('../src/generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

// mesmo esquema do PrismaService
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

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

main()
    .catch((err) => {
        console.error('❌ Erro no seed:', err);
        process.exit(1);
    })
    .finally(async () => {
        prisma.$disconnect();
    });
