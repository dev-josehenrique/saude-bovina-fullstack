const { z } = require('zod');

const data = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Data inválida');

const bovinoBase = z.object({
  nome: z.string().trim().min(1, 'Nome obrigatório').max(50),
  sexo: z.enum(['Macho', 'Fêmea'], { errorMap: () => ({ message: "Sexo deve ser 'Macho' ou 'Fêmea'" }) }),
  n_brinco: z.coerce.number().int().positive('Brinco deve ser inteiro positivo'),
  data_nascimento: data.nullish(),
  registro_po: z.string().trim().max(50).nullish(),
  id_raca: z.coerce.number().int().positive().nullish(),
  idbovino_matriz: z.coerce.number().int().positive().nullish(),
});

const criarBovinoSchema = bovinoBase;
const atualizarBovinoSchema = bovinoBase
  .partial()
  .refine((o) => Object.keys(o).length > 0, { message: 'Informe ao menos um campo para atualizar' });

const pesagemSchema = z.object({
  peso: z.coerce.number().positive('Peso deve ser positivo'),
  data: z.string().datetime({ offset: true }).or(data).optional(),
});

const idSchema = z.coerce.number().int().positive('ID inválido');

module.exports = { criarBovinoSchema, atualizarBovinoSchema, pesagemSchema, idSchema };
