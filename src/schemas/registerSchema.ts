import { z } from 'zod';

export const registerSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  username: z
    .string()
    .min(3, 'Username deve ter no mínimo 3 caracteres')
    .max(30, 'Username deve ter no máximo 30 caracteres')
    .regex(/^[a-z0-9._]+$/, 'Username deve conter apenas letras minúsculas, números, pontos e underscores')
    .trim()
    .toLowerCase(),
  
  email: z
    .string()
    .email('Formato de email inválido')
    .trim()
    .toLowerCase(),
  
  senha: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^()\-_+=<>.,;:]).{8,}$/, 
      'Senha fraca! Use pelo menos 8 caracteres com 1 maiúscula (A-Z), 1 minúscula (a-z), 1 número (0-9) e 1 símbolo (@$!%*?&#^()-_+=<>.,;:)'),
  
  confirmacaoSenha: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.senha === data.confirmacaoSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmacaoSenha'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

