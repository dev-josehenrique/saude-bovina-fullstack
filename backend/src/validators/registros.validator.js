// Esquemas Zod de validação de ocorrência no histórico, vacinação em lote e tratamento.
const { z } = require('zod');

const data = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Data inválida');

const idOpcional = z.preprocess((v) => (v === '' || v == null ? undefined : v), z.coerce.number().int().positive().optional());

const ocorrenciaSchema = z.object({
  data,
  descricao: z.string().trim().min(3, 'Descreva a ocorrência (mín. 3 caracteres)').max(1000, 'Máximo de 1000 caracteres'),
});

const novaVacinaSchema = z.object({
  marca: z.string().trim().min(1, 'Informe a marca').max(50, 'Máximo de 50 caracteres'),
  antigeno: z.string().trim().min(1, 'Informe o antígeno').max(50, 'Máximo de 50 caracteres'),
});

// Vacinação: usa uma vacina existente (id_vacina) OU cadastra uma nova (nova_vacina) na mesma operação.
const vacinacaoLoteSchema = z
  .object({
    id_vacina: idOpcional,
    nova_vacina: novaVacinaSchema.optional(),
    dose: z.string().trim().min(1, 'Informe a dose').max(50, 'Máximo de 50 caracteres'),
    data,
    ids: z.array(z.coerce.number().int().positive()).min(1, 'Selecione ao menos um animal').max(500, 'Máximo de 500 animais por lote'),
  })
  .refine((o) => o.id_vacina || o.nova_vacina, { message: 'Selecione uma vacina ou cadastre uma nova', path: ['id_vacina'] });

const tratamentoSchema = z.object({
  data,
  id_doenca: z.coerce.number().int().positive('Selecione a doença'),
  id_tipo_tratamento: z.coerce.number().int().positive('Selecione o tipo'),
  id_veterinario: z.coerce.number().int().positive('Selecione o veterinário'),
  id_medicamento: idOpcional,
  dose: z.string().trim().max(50, 'Máximo de 50 caracteres').optional(),
}).refine((o) => !o.id_medicamento || (o.dose && o.dose.length > 0), { message: 'Informe a dose do medicamento', path: ['dose'] });

module.exports = { ocorrenciaSchema, vacinacaoLoteSchema, novaVacinaSchema, tratamentoSchema };
