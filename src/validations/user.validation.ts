import z from 'zod';

export const idParamsShema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
});

export const getUsersQuerySchema = z
  .object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10)),
    search: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional(),
  })
  .refine(
    (data) => {
      return data.page >= 1 && data.limit >= 1 && data.limit <= 100;
    },
    {
      message: 'Page must be >= 1 and limit must be between 1 and 100',
    }
  );
export const blockUserShema = z.object({
  reason: z.string().optional(),
});
