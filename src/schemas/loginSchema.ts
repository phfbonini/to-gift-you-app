import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('Formato de email inválido')
    .min(1, 'Email é obrigatório')
    .trim()
    .toLowerCase(),
  
  senha: z
    .string()
    .min(1, 'Senha é obrigatória'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

