import { z } from 'zod';

export const itemSchema = z.object({
  nome: z
    .string({ required_error: 'O nome é obrigatório' })
    .min(2, 'O nome deve ter pelo menos 2 caracteres'),
  quantidade: z
    .number()
    .min(1, 'A quantidade mínima é 1'),
  categoria: z
    .string()
    .optional(),
});