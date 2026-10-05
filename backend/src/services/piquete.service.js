const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');

// "Animal atualmente no piquete" = movimentação sem data de saída (mesma regra dos relatórios do trabalho de BD).
const atuais = { data_saida: null };

async function listar() {
  const piquetes = await prisma.piquete.findMany({
    include: { propriedade: true, _count: { select: { movimentacoes: { where: atuais } } } },
    orderBy: { id_piquete: 'asc' },
  });
  return piquetes.map(({ _count, ...p }) => ({ ...p, animais_atuais: _count.movimentacoes }));
}

async function buscarPorId(id) {
  const piquete = await prisma.piquete.findUnique({
    where: { id_piquete: id },
    include: {
      propriedade: true,
      movimentacoes: {
        where: atuais,
        include: { bovino: { include: { raca: true } } },
        orderBy: { data_entrada: 'asc' },
      },
    },
  });
  if (!piquete) throw new AppError('Piquete não encontrado', 404);

  const { movimentacoes, ...dados } = piquete;
  return {
    ...dados,
    animais_atuais: movimentacoes.length,
    animais: movimentacoes.map((m) => ({ ...m.bovino, data_entrada: m.data_entrada })),
  };
}

async function criar(dados) {
  const prop = await prisma.propriedade.findUnique({ where: { id_propriedade: dados.id_propriedade }, select: { id_propriedade: true } });
  if (!prop) throw new AppError('Propriedade não encontrada', 400);
  return prisma.piquete.create({ data: dados, include: { propriedade: true } });
}

module.exports = { listar, buscarPorId, criar };
