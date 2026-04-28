import { z } from 'zod';

export const organizationFormSchema = z.object({
  name: z.string().min(2, {
    error: 'OrganizationForm.Error.Name',
  }),
  domains: z
    .string()
    .array()
    .refine((domains) => domains.length > 0, {
      error: 'OrganizationForm.Error.Domain',
    }),
});
