// Consultas simples de apoio: raças, propriedades (com piquetes) e vacinas.
const prisma = require('../lib/prisma');

const bovinoResumo = { select: { id_bovino: true, nome: true, n_brinco: true } };

module.exports = {
  racas: () => prisma.raca.findMany({ orderBy: { id_raca: 'asc' } }),
  propriedades: () =>
    prisma.propriedade.findMany({ include: { piquetes: true }, orderBy: { id_propriedade: 'asc' } }),
  vacinas: () => prisma.vacina.findMany({ orderBy: { id_vacina: 'asc' } }),
};
