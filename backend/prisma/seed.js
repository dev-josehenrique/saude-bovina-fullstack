// Popula o banco com os dados do trabalho de Banco de Dados (dados.py) + um usuário de demonstração.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const inserts = require('./seedData');

const prisma = new PrismaClient();

async function main() {
  const jaPopulado = await prisma.raca.count();
  if (jaPopulado > 0) {
    console.log('Banco já possui dados. Seed ignorado (rode "npx prisma db push --force-reset" para recomeçar).');
  } else {
    await prisma.$transaction(async (tx) => {
      for (const sql of inserts) await tx.$executeRawUnsafe(sql);
    });
    console.log('Dados do rebanho inseridos.');
  }

  await prisma.usuario.upsert({
    where: { email: 'admin@fazenda.com' },
    update: {},
    create: { nome: 'Administrador', email: 'admin@fazenda.com', senha_hash: await bcrypt.hash('123456', 10) },
  });
  console.log('Usuário demo: admin@fazenda.com / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
