// Esquemas Zod de validação de piquetes e de veterinários (criação e atualização).
const { z } = require('zod');

const criarPiqueteSchema = z.object({
  nome: z.string().trim().min(1, 'Nome obrigatório').max(50, 'Máximo de 50 caracteres'),
  lotacao_max: z.coerce.number().int('Deve ser inteiro').positive('Lotação deve ser maior que zero'),
  id_propriedade: z.coerce.number().int().positive('Propriedade inválida'),
});

const criarVeterinarioSchema = z.object({
  nome: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres').max(50, 'Máximo de 50 caracteres'),
  crmv: z.string().trim().min(3, 'CRMV obrigatório').max(50, 'Máximo de 50 caracteres'),
});

const atualizarVeterinarioSchema = criarVeterinarioSchema
  .partial()
  .refine((o) => Object.keys(o).length > 0, { message: 'Informe ao menos um campo para atualizar' });

module.exports = { criarPiqueteSchema, criarVeterinarioSchema, atualizarVeterinarioSchema };
