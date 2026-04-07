import { prisma } from '../../core/db/index.js';

export const shopService = {
  async upsertShop(data: {
    myshoplineDomain: string;
    accessToken: string;
    scopes?: string;
  }) {
    return prisma.shop.upsert({
      where: { myshoplineDomain: data.myshoplineDomain },
      update: {
        accessToken: data.accessToken,
        scopes: data.scopes,
      },
      create: {
        myshoplineDomain: data.myshoplineDomain,
        accessToken: data.accessToken,
        scopes: data.scopes,
      },
    });
  },

  async getShopByDomain(domain: string) {
    return prisma.shop.findUnique({ where: { myshoplineDomain: domain } });
  },

  async getShopById(id: string) {
    return prisma.shop.findUnique({ where: { id } });
  },

  async listShops() {
    return prisma.shop.findMany({ orderBy: { installedAt: 'desc' } });
  },
};
