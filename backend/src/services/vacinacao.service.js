const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');

// Aplica uma vacina em vários animais de uma vez (também serve para 1 animal).
// A vacina pode ser existente (id_vacina) ou cadastrada na hora (nova_vacina), tudo numa transação.
// A PK de vacina_bovino é (data, id_vacina, id_bovino): repetições são ignoradas, não geram erro.
async function aplicarEmLote({ id_vacina, nova_vacina, dose, data, ids }) {
  const unicos = [...new Set(ids)];

  const existentes = await prisma.bovino.findMany({ where: { id_bovino: { in: unicos } }, select: { id_bovino: true } });
  if (existentes.length !== unicos.length) {
    const achados = new Set(existentes.map((b) => b.id_bovino));
    throw new AppError(`Animais não encontrados: ${unicos.filter((i) => !achados.has(i)).join(', ')}`, 400);
  }

  return prisma.$transaction(async (tx) => {
    let vacina;
    if (nova_vacina) {
      // evita duplicar a vacina se já houver a mesma marca/antígeno
      vacina =
        (await tx.vacina.findFirst({
          where: {
            marca: { equals: nova_vacina.marca, mode: 'insensitive' },
            antigeno: { equals: nova_vacina.antigeno, mode: 'insensitive' },
          },
        })) ?? (await tx.vacina.create({ data: nova_vacina }));
    } else {
      vacina = await tx.vacina.findUnique({ where: { id_vacina } });
      if (!vacina) throw new AppError('Vacina não encontrada', 404);
    }

    const { count } = await tx.vacinaBovino.createMany({
      data: unicos.map((id_bovino) => ({ id_vacina: vacina.id_vacina, id_bovino, dose, data: new Date(`${data}T00:00:00.000Z`) })),
      skipDuplicates: true,
    });
    return { vacina, solicitadas: unicos.length, aplicadas: count, ignoradas: unicos.length - count };
  });
}

module.exports = { aplicarEmLote };
