import { z } from 'zod';

export const communityFormSchema = z.object({
  community_name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  community_description: z.string().min(2, {
    message: 'Description must be at least 2 characters.',
  }),
  price: z.number(),
  fee_type: z.string().min(2, {
    message: 'FeeType must be at least 2 characters.',
  }),
  organizations_id: z
    .array(z.string())
    .min(1, { message: 'Choose an organization to be part of this community' }),
});