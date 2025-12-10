require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

console.log('Testing Prisma Connection...');
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        console.log('Successfully connected to database');
        await prisma.$disconnect();
    } catch (e) {
        console.error('Connection failed:');
        console.dir(e, { depth: null });
        process.exit(1);
    }
}

main();
