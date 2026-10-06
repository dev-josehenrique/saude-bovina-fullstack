// Cria a instância única do PrismaClient, compartilhada por todos os services para acessar o banco.
const { PrismaClient } = require('@prisma/client');

module.exports = new PrismaClient();
