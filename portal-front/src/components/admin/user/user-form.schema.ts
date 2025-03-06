import { z } from 'zod';

export const userFormSchema = z.object({
  email: z
    .string()
    .min(2, { message: 'Email must be at least 2 characters.' })
    .email('This is not a valid email.'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  password: z.string().optional(),
  capabilities: z.array(z.string()).default([]),
});

export const userEditFormSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  capabilities: z.array(z.string()).default([]),
});

export const userAdminFormSchema = z.object({
  email: z
    .string()
    .min(2, { message: 'Email must be at least 2 characters.' })
    .email('This is not a valid email.'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  password: z.string().optional(),
  organization_capabilities: z
    .array(
      z.object({
        organization_id: z.string(),
        capabilities: z.array(z.string()),
      })
    )
    .default([]),
});
export const userEditAdminFormSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  organization_capabilities: z
    .array(
      z.object({
        organization_id: z.string(),
        capabilities: z.array(z.string()),
      })
    )
    .default([]),
});
