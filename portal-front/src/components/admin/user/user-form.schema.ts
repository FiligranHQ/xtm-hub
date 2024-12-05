import { z } from 'zod';

export const userFormSchema = z.object({
  email: z
    .string()
    .min(2, { message: 'Email must be at least 2 characters.' })
    .email('This is not a valid email.'),
  password: z.string().optional(),
  organizations: z.array(z.string()).default([]),
  roles_id: z
    .array(z.string())
    .min(1, { message: 'Choose a role for the user' }),
});

export const userEditFormSchema = z.object({
  email: z
    .string()
    .min(2, { message: 'Email must be at least 2 characters.' })
    .email('This is not a valid email.'),
  password: z.string().optional(),
  organizations: z.array(z.string()).default([]),
  roles_id: z
    .array(z.string())
    .min(1, { message: 'Choose a role for the user' }),
});
