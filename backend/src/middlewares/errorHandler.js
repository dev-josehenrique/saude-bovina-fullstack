// Tratamento central de erros: converte falhas de validação, AppError e erros do Prisma em respostas JSON padronizadas.
const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');
const AppError = require('../lib/AppError');

// Tratamento de erros centralizado: toda falha das rotas termina aqui.
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.issues.map((i) => ({ campo: i.path.join('.'), mensagem: i.message })),
    });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Registro duplicado (valor único já existe)' });
    if (err.code === 'P2025') return res.status(404).json({ error: 'Registro não encontrado' });
    if (err.code === 'P2003') {
      return res.status(409).json({ error: 'Violação de chave estrangeira (registro relacionado inexistente ou em uso)' });
    }
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Erro interno do servidor' });
};
