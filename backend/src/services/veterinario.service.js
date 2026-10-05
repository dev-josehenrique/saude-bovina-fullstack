const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');

const listar = async () => {
  const vets = await prisma.veterinario.findMany({
    include: { _count: { select: { tratamentos: true } } },
    orderBy: { id_veterinario: 'asc' },
  });
  return vets.map(({ _count, ...v }) => ({ ...v, total_tratamentos: _count.tratamentos }));
};

// Detalhe: dados + tratamentos (recentes primeiro) + animais distintos atendidos.
async function buscarPorId(id) {
  const vet = await prisma.veterinario.findUnique({
    where: { id_veterinario: id },
    include: {
      tratamentos: {
        include: {
          bovino: { select: { id_bovino: true, nome: true, n_brinco: true, sexo: true } },
          doenca: true,
          tipo_tratamento: true,
          receitas: { include: { medicamento: true } },
        },
        orderBy: [{ data: 'desc' }, { id_tratamento: 'desc' }],
      },
    },
  });
  if (!vet) throw new AppError('Veterinário não encontrado', 404);

  const porAnimal = new Map();
  for (const t of vet.tratamentos) {
    if (!t.bovino) continue;
    const atual = porAnimal.get(t.bovino.id_bovino);
    if (atual) atual.total_tratamentos += 1;
    else porAnimal.set(t.bovino.id_bovino, { ...t.bovino, total_tratamentos: 1, ultimo_tratamento: t.data });
  }
  return { ...vet, total_tratamentos: vet.tratamentos.length, animais_tratados: [...porAnimal.values()] };
}

// crmv não é UNIQUE no DDL original; a unicidade é garantida aqui na aplicação.
async function garantirCrmvLivre(crmv, ignorarId) {
  const existente = await prisma.veterinario.findFirst({
    where: { crmv: { equals: crmv, mode: 'insensitive' }, ...(ignorarId && { NOT: { id_veterinario: ignorarId } }) },
  });
  if (existente) throw new AppError('Já existe veterinário com este CRMV', 409);
}

async function criar(dados) {
  await garantirCrmvLivre(dados.crmv);
  return prisma.veterinario.create({ data: dados });
}

async function atualizar(id, dados) {
  const atual = await prisma.veterinario.findUnique({ where: { id_veterinario: id }, select: { id_veterinario: true } });
  if (!atual) throw new AppError('Veterinário não encontrado', 404);
  if (dados.crmv) await garantirCrmvLivre(dados.crmv, id);
  return prisma.veterinario.update({ where: { id_veterinario: id }, data: dados });
}

module.exports = { listar, buscarPorId, criar, atualizar };
