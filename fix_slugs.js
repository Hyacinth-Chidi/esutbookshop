require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`UPDATE books SET slug = 'book-' || id WHERE slug IS NULL`;
  console.log('Fixed null slugs');
}

main().catch(console.error).finally(() => prisma.$disconnect());
