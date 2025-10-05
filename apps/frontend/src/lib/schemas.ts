import z from 'zod';

export const workspaceSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  color: z.string().min(3, 'Color must be at least 3 characters'),
  description: z.string().optional(),
});

export const boardSchema = z.object({
  name: z.string().min(3, 'Board name must be at least 3 characters'),
  description: z.string().optional(),
  color: z.string().min(3, 'Color must be selected'),
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

export const groupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Group name must be less than 100 characters'),
  description: z.string().optional(),
  groupType: z.enum(['status', 'priority', 'category', 'custom']),
  color: z.string().optional(),
});

export const taskSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(200, 'Item name must be less than 200 characters'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done', 'blocked', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});