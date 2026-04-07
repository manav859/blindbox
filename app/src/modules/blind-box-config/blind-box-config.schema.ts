import { z } from 'zod';

export const createBlindBoxSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID'),
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Name is required').max(200),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  items: z
    .array(
      z.object({
        shoplineVariantId: z.string().min(1),
        name: z.string().min(1),
        weight: z.number().int().min(1, 'Weight must be at least 1'),
        inventory: z.number().int().min(0, 'Inventory cannot be negative'),
        enabled: z.boolean().default(true),
      }),
    )
    .min(1, 'At least one pool item is required'),
});

export const updateBlindBoxSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const createPoolItemSchema = z.object({
  shoplineVariantId: z.string().min(1),
  name: z.string().min(1),
  weight: z.number().int().min(1),
  inventory: z.number().int().min(0),
  enabled: z.boolean().default(true),
});

export const updatePoolItemSchema = z.object({
  name: z.string().min(1).optional(),
  weight: z.number().int().min(1).optional(),
  inventory: z.number().int().min(0).optional(),
  enabled: z.boolean().optional(),
});

export type CreateBlindBoxInput = z.infer<typeof createBlindBoxSchema>;
export type UpdateBlindBoxInput = z.infer<typeof updateBlindBoxSchema>;
export type CreatePoolItemInput = z.infer<typeof createPoolItemSchema>;
export type UpdatePoolItemInput = z.infer<typeof updatePoolItemSchema>;
