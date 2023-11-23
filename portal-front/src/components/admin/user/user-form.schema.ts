import { z } from 'zod';

export const userFormSchema = z.object({
  email: z
    .string()
    .min(2, { message: 'Email must be at least 2 characters.' })
    .email('This is not a valid email.'),
  first_name: z.string().min(2, {
    message: 'Firstname must be at least 2 characters.',
  }),
  last_name: z.string().min(2, {
    message: 'Lastname must be at least 2 characters.',
  }),
  password: z.string().min(2, {
    message: 'Password must be at least 2 characters.',
  }),
  organization_id: z.string().min(2, {
    message: 'Choose an organisation',
  }),
});

export const userEditFormSchema = z.object({
  email: z
    .string()
    .min(2, { message: 'Email must be at least 2 characters.' })
    .email('This is not a valid email.'),
  first_name: z.string().min(2, {
    message: 'Firstname must be at least 2 characters.',
  }),
  last_name: z.string().min(2, {
    message: 'Lastname must be at least 2 characters.',
  }),
  password: z.string().optional(),
  organization_id: z.string().min(2, {
    message: 'Choose an organisation',
  }),
});
