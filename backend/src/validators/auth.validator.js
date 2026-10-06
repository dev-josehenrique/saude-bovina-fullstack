// Esquemas Zod de validação do cadastro e do login de usuários.
const { z } = require('zod');

const registroSchema = z.object({
  nome: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres').max(100),
  email: z.string().trim().toLowerCase().email('E-mail inválido').max(150),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').max(72),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
});

module.exports = { registroSchema, loginSchema };
