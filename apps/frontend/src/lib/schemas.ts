import z from 'zod';

export const workspaceSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  color: z.string().min(3, 'Color must be at least 3 characters'),
  description: z.string().optional(),
});

export const teamSchema = z.object({
  name: z
    .string()
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name must not exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
});
