import { prisma } from '../../core/db/index.js';
import { NotFoundError, ConflictError } from '../../core/errors/index.js';
import type {
  CreateBlindBoxInput,
  UpdateBlindBoxInput,
  CreatePoolItemInput,
  UpdatePoolItemInput,
} from './blind-box-config.schema.js';

export const blindBoxConfigService = {
  // ───── Blind Box CRUD ─────

  async list(shopId?: string) {
    return prisma.blindBox.findMany({
      where: shopId ? { shopId } : undefined,
      include: { items: true, _count: { select: { assignments: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async getById(id: string) {
    const box = await prisma.blindBox.findUnique({
      where: { id },
      include: { items: true, _count: { select: { assignments: true } } },
    });
    if (!box) throw new NotFoundError('BlindBox');
    return box;
  },

  async getByProductId(productId: string) {
    return prisma.blindBox.findUnique({
      where: { productId },
      include: { items: { where: { enabled: true } } },
    });
  },

  async create(input: CreateBlindBoxInput) {
    const existing = await prisma.blindBox.findUnique({ where: { productId: input.productId } });
    if (existing) {
      throw new ConflictError('A Blind Box already exists for this product');
    }

    return prisma.blindBox.create({
      data: {
        shopId: input.shopId,
        productId: input.productId,
        name: input.name,
        status: input.status,
        items: {
          create: input.items.map((item) => ({
            shoplineVariantId: item.shoplineVariantId,
            name: item.name,
            weight: item.weight,
            inventory: item.inventory,
            enabled: item.enabled,
          })),
        },
      },
      include: { items: true },
    });
  },

  async update(id: string, input: UpdateBlindBoxInput) {
    await this.getById(id); // throws NotFoundError
    return prisma.blindBox.update({
      where: { id },
      data: input,
      include: { items: true },
    });
  },

  async remove(id: string) {
    await this.getById(id);
    return prisma.blindBox.delete({ where: { id } });
  },

  // ───── Pool Item CRUD ─────

  async addItem(blindBoxId: string, input: CreatePoolItemInput) {
    await this.getById(blindBoxId);
    return prisma.blindBoxItem.create({
      data: { blindBoxId, ...input },
    });
  },

  async updateItem(itemId: string, input: UpdatePoolItemInput) {
    const item = await prisma.blindBoxItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundError('BlindBoxItem');
    return prisma.blindBoxItem.update({ where: { id: itemId }, data: input });
  },

  async removeItem(itemId: string) {
    const item = await prisma.blindBoxItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundError('BlindBoxItem');
    return prisma.blindBoxItem.delete({ where: { id: itemId } });
  },
};
