import { z } from 'zod';

export const postValidationSchema = z.object({
  title: z.string({ required_error: 'Título é obrigatório' }).trim().min(3, 'Título muito curto'),
  subtitle: z.string().trim().optional(),
  content: z.string({ required_error: 'O contéudo da postagem é obrigatório' }).trim().min(10, 'Conteúdo muito curto'),
  imageUrl: z.string().url('A url da imagem é inválida').or(z.literal('')).optional(),
  author: z.string({ required_error: 'Autor é obrigatório' }).trim().min(2, 'Nome muito curto')
});

export const eventValidationSchema = z.object({
  title: z.string({ required_error: 'Título é obrigatório' }).trim().min(3, 'Título muito curto'),
  desc: z.string({ required_error: 'O campo de descrição do evento é obrigatório' }).trim().min(5, 'Descrição muito curta'),
  imageUrl: z.string().url('A url da imagem é inválida').or(z.literal('')).optional(),
  eventLoc: z.string({ required_error: 'A localização do evento é obrigatória' }).trim().min(1, 'A localização do evento é obrigatória'),
  eventDate: z.coerce.date({
    required_error: 'A data é um campo obrigatório',
    invalid_type_error: 'Data inválida'
  })
});


export const userAuthSchema = z.object({
  name: z.string({ required_error: 'O nome é obrigatório' }).trim().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  pass: z.string({ required_error: 'A senha é obrigatória' }).min(6, 'A senha deve ter no mínimo 6 caracteres')
});
