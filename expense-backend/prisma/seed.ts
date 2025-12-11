import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
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
            email: passwordLidy,
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
        await prisma.$disconnect();
    });
