// Consulta de tratamentos (com filtros por veterinário, animal e tipo) e dos tipos de tratamento.
const prisma = require('../lib/prisma');

const incluir = {
  bovino: { select: { id_bovino: true, nome: true, n_brinco: true, sexo: true } },
  veterinario: true,
  doenca: true,
  tipo_tratamento: true,
  receitas: { include: { medicamento: true } },
};

// Mais recentes primeiro; filtros opcionais por veterinário, animal e tipo.
const listar = ({ id_veterinario, id_bovino, id_tipo_tratamento, limite } = {}) =>
  prisma.tratamento.findMany({
    where: {
      ...(id_veterinario && { id_veterinario: Number(id_veterinario) }),
      ...(id_bovino && { id_bovino: Number(id_bovino) }),
      ...(id_tipo_tratamento && { id_tipo_tratamento: Number(id_tipo_tratamento) }),
    },
    include: incluir,
    orderBy: [{ data: 'desc' }, { id_tratamento: 'desc' }],
    ...(limite && Number(limite) > 0 && { take: Math.min(Number(limite), 500) }),
  });

const tipos = () => prisma.tipoTratamento.findMany({ orderBy: { id_tipo_tratamento: 'asc' } });

module.exports = { listar, tipos };
