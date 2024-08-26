import { z } from 'zod';

export const communityFormSchema = z.object({
  community_name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  community_description: z.string().min(2, {
    message: 'Description must be at least 2 characters.',
  }),
  justification: z
    .string()
    .min(2, {
      message: 'Description must be at least 2 characters.',
    })
    .optional(),
  price: z.number().optional(),
  fee_type: z
    .string()
    .min(2, {
      message: 'FeeType must be at least 2 characters.',
    })
    .optional(),
  organizations_id: z
    .array(z.string())
    .min(1, { message: 'Choose an organization to be part of this community' })
    .optional(),
  requested_services: z.array(z.string()).optional(),
  billing_manager: z.string().optional(),
});

export const communityAcceptFormSchema = z.object({
  price: z.number().optional(),
  fee_type: z
    .string()
    .min(2, {
      message: 'FeeType must be at least 2 characters.',
    })
    .optional(),
});