const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');

const paraData = (s) => (s ? new Date(`${s}T00:00:00.000Z`) : s);

function normalizar(dados) {
  const d = { ...dados };
  if ('data_nascimento' in d) d.data_nascimento = paraData(d.data_nascimento);
  return d;
}

const incluirResumo = {
  raca: true,
  matriz: { select: { id_bovino: true, nome: true, n_brinco: true } },
};

const listar = ({ busca, id_raca, sexo } = {}) =>
  prisma.bovino.findMany({
    where: {
      ...(busca && {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' } },
          ...(Number.isInteger(Number(busca)) ? [{ n_brinco: Number(busca) }] : []),
        ],
      }),
      ...(id_raca && { id_raca: Number(id_raca) }),
      ...(sexo && { sexo }),
    },
    include: {
      ...incluirResumo,
      // piquete atual = movimentação sem data de saída (usado no filtro por piquete)
      piquetes: { where: { data_saida: null }, include: { piquete: { select: { id_piquete: true, nome: true } } } },
    },
    orderBy: { id_bovino: 'asc' },
  });

async function buscarBasico(id) {
  const b = await prisma.bovino.findUnique({ where: { id_bovino: id }, select: { id_bovino: true } });
  if (!b) throw new AppError('Bovino não encontrado', 404);
}

async function buscarPorId(id) {
  const bovino = await prisma.bovino.findUnique({
    where: { id_bovino: id },
    include: {
      ...incluirResumo,
      filhos: { select: { id_bovino: true, nome: true, n_brinco: true } },
      pesagens: { orderBy: { data: 'desc' } },
      historicos: { orderBy: { data: 'desc' } },
      vacinas: { include: { vacina: true }, orderBy: { data: 'desc' } },
      tratamentos: {
        include: { doenca: true, veterinario: true, tipo_tratamento: true, receitas: { include: { medicamento: true } } },
        orderBy: { data: 'desc' },
      },
      piquetes: { include: { piquete: true }, orderBy: { data_entrada: 'desc' } },
    },
  });
  if (!bovino) throw new AppError('Bovino não encontrado', 404);
  return bovino;
}

const criar = (dados) => prisma.bovino.create({ data: normalizar(dados), include: incluirResumo });

async function atualizar(id, dados) {
  await buscarBasico(id);
  return prisma.bovino.update({ where: { id_bovino: id }, data: normalizar(dados), include: incluirResumo });
}

async function remover(id) {
  await buscarBasico(id);
  // As FKs do DDL original não têm cascade: remove dependentes e desvincula filhos numa transação.
  await prisma.$transaction([
    prisma.receita.deleteMany({ where: { tratamento: { id_bovino: id } } }),
    prisma.tratamento.deleteMany({ where: { id_bovino: id } }),
    prisma.historico.deleteMany({ where: { id_bovino: id } }),
    prisma.pesagem.deleteMany({ where: { id_bovino: id } }),
    prisma.vacinaBovino.deleteMany({ where: { id_bovino: id } }),
    prisma.piqueteBovino.deleteMany({ where: { id_bovino: id } }),
    prisma.bovino.updateMany({ where: { idbovino_matriz: id }, data: { idbovino_matriz: null } }),
    prisma.bovino.delete({ where: { id_bovino: id } }),
  ]);
}

async function registrarPesagem(id, { peso, data }) {
  await buscarBasico(id);
  return prisma.pesagem.create({ data: { id_bovino: id, peso, data: data ? new Date(data) : new Date() } });
}

module.exports = { listar, buscarPorId, criar, atualizar, remover, registrarPesagem };
