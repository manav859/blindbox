import { prisma } from '../../core/db/index.js';
import { logger } from '../../core/logger/index.js';
import { AppError, NotFoundError } from '../../core/errors/index.js';
import type { BlindBoxItem } from '@prisma/client';

interface AssignmentRequest {
  orderId: string;
  blindBoxId: string;
  quantity: number;
}

interface AssignmentResult {
  orderId: string;
  blindBoxId: string;
  assignedItemId: string;
  assignedItemName: string;
  status: string;
}

/**
 * Weighted random selection from eligible pool items.
 * Uses cumulative-weight approach for O(n) selection.
 */
function weightedRandomPick(items: BlindBoxItem[]): BlindBoxItem {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const item of items) {
    if (roll < item.weight) {
      return item;
    }
    roll -= item.weight;
  }

  // Fallback – shouldn't reach here if items.length > 0
  return items[items.length - 1]!;
}

export const assignmentService = {
  /**
   * Core assignment engine.
   * Atomically selects a weighted-random item, decrements its stock,
   * and records the assignment – all inside a Prisma interactive transaction
   * with row-level safety.
   */
  async assignItem(req: AssignmentRequest): Promise<AssignmentResult> {
    const { orderId, blindBoxId, quantity } = req;

    // Check for duplicate assignment (idempotency at order+box level)
    const existing = await prisma.assignment.findFirst({
      where: { orderId, blindBoxId },
    });
    if (existing) {
      logger.info({ orderId, blindBoxId }, 'Assignment already exists – skipping (idempotent)');
      const item = await prisma.blindBoxItem.findUnique({ where: { id: existing.itemId } });
      return {
        orderId,
        blindBoxId,
        assignedItemId: existing.itemId,
        assignedItemName: item?.name ?? 'Unknown',
        status: existing.status,
      };
    }

    const results: AssignmentResult[] = [];

    for (let i = 0; i < quantity; i++) {
      const result = await this.assignSingleItem(orderId, blindBoxId);
      results.push(result);
    }

    // For simplicity return the first result; caller can handle multi-quantity
    return results[0]!;
  },

  async assignSingleItem(orderId: string, blindBoxId: string): Promise<AssignmentResult> {
    const MAX_RETRIES = 5;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const result = await prisma.$transaction(async (tx: any) => {
          // 1. Load eligible pool items
          const eligible = await tx.blindBoxItem.findMany({
            where: {
              blindBoxId,
              enabled: true,
              inventory: { gt: 0 },
            },
          });

          if (eligible.length === 0) {
            throw new AppError('No eligible items in pool – all out of stock', 422);
          }

          // 2. Weighted random pick
          const selected = weightedRandomPick(eligible);

          // 3. Atomically decrement stock using raw SQL for row-level safety
          const updated = await tx.$executeRaw`
            UPDATE "BlindBoxItem"
            SET inventory = inventory - 1
            WHERE id = ${selected.id} AND inventory > 0
          `;

          if (updated === 0) {
            // Stock was claimed by concurrent request – retry
            throw new Error('STOCK_RACE_RETRY');
          }

          // 4. Create assignment record
          const assignment = await tx.assignment.create({
            data: {
              blindBoxId,
              itemId: selected.id,
              orderId,
              status: 'COMPLETED',
            },
          });

          logger.info(
            { orderId, blindBoxId, itemId: selected.id, itemName: selected.name },
            'Assignment completed',
          );

          return {
            orderId,
            blindBoxId,
            assignedItemId: selected.id,
            assignedItemName: selected.name,
            status: assignment.status,
          };
        });

        return result;
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'STOCK_RACE_RETRY') {
          logger.warn({ attempt: attempt + 1 }, 'Stock race detected – retrying assignment');
          continue;
        }
        throw err;
      }
    }

    throw new AppError('Assignment failed after max retries – pool may be exhausted', 503);
  },

  /**
   * List assignments for a specific blind box.
   */
  async listByBlindBox(blindBoxId: string) {
    return prisma.assignment.findMany({
      where: { blindBoxId },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * List all assignments, optionally filtered.
   */
  async listAll(filters?: { shopId?: string }) {
    return prisma.assignment.findMany({
      where: filters?.shopId ? { blindBox: { shopId: filters.shopId } } : undefined,
      include: { item: true, blindBox: { select: { id: true, name: true, productId: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get assignments for a specific order.
   */
  async getByOrderId(orderId: string) {
    return prisma.assignment.findMany({
      where: { orderId },
      include: {
        item: true,
        blindBox: { select: { id: true, name: true, productId: true } },
      },
    });
  },
};
