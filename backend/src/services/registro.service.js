const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { Prisma } = require('@prisma/client');

const dia = (s) => new Date(`${s}T00:00:00.000Z`);
const duplicado = (e, msg) => {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw new AppError(msg, 409);
  throw e;
};

async function garantirBovino(id) {
  const b = await prisma.bovino.findUnique({ where: { id_bovino: id }, select: { id_bovino: true } });
  if (!b) throw new AppError('Bovino não encontrado', 404);
}

// Ocorrência no histórico do animal (PK: id_bovino + data → uma por dia).
async function registrarOcorrencia(id, { data, descricao }) {
  await garantirBovino(id);
  try {
    return await prisma.historico.create({ data: { id_bovino: id, data: dia(data), descricao } });
  } catch (e) {
    return duplicado(e, 'Já existe uma ocorrência registrada nesta data para este animal. Edite a descrição ou escolha outra data.');
  }
}

// Tratamento individual, com receita opcional (medicamento + dose).
async function registrarTratamento(id, { data, id_doenca, id_tipo_tratamento, id_veterinario, id_medicamento, dose }) {
  await garantirBovino(id);
  const [d, t, v, m] = await Promise.all([
    prisma.doenca.findUnique({ where: { id_doenca }, select: { id_doenca: true } }),
    prisma.tipoTratamento.findUnique({ where: { id_tipo_tratamento }, select: { id_tipo_tratamento: true } }),
    prisma.veterinario.findUnique({ where: { id_veterinario }, select: { id_veterinario: true } }),
    id_medicamento ? prisma.medicamento.findUnique({ where: { id_medicamento }, select: { id_medicamento: true } }) : true,
  ]);
  if (!d) throw new AppError('Doença não encontrada', 400);
  if (!t) throw new AppError('Tipo de tratamento não encontrado', 400);
  if (!v) throw new AppError('Veterinário não encontrado', 400);
  if (!m) throw new AppError('Medicamento não encontrado', 400);

  try {
    return await prisma.tratamento.create({
      data: {
        id_bovino: id, data: dia(data), id_doenca, id_tipo_tratamento, id_veterinario,
        ...(id_medicamento && { receitas: { create: [{ id_medicamento, dose }] } }),
      },
      include: { doenca: true, tipo_tratamento: true, veterinario: true, receitas: { include: { medicamento: true } } },
    });
  } catch (e) {
    return duplicado(e, 'Este animal já tem um tratamento deste tipo registrado nesta data.');
  }
}

const doencas = () => prisma.doenca.findMany({ orderBy: { nome: 'asc' } });
const medicamentos = () => prisma.medicamento.findMany({ orderBy: { nome: 'asc' } });

module.exports = { registrarOcorrencia, registrarTratamento, doencas, medicamentos };
