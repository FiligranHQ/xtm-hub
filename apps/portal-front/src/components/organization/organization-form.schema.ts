import { z } from 'zod';

export const organizationFormSchema = z.object({
  name: z.string().min(2, { message: 'OrganizationForm.Error.Name' }),
  domains: z
    .string()
    .array()
    .refine((domains) => domains.length > 0, {
      message: 'OrganizationForm.Error.Domain',
    }),
});
