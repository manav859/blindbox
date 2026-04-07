import type { FastifyInstance } from 'fastify';
import { productService } from './products.service.js';

export async function productRoutes(app: FastifyInstance) {
  /**
   * GET /api/admin/products
   * Lists products from the SHOPLINE store.
   * Query: ?shop=domain&token=accessToken (will be replaced by session-based auth)
   */
  app.get('/', async (request, reply) => {
    const { shop, token } = request.query as { shop?: string; token?: string };
    const products = await productService.listProducts(shop ?? '', token ?? '');
    return reply.send(products);
  });

  /**
   * GET /api/admin/products/:productId
   */
  app.get('/:productId', async (request, reply) => {
    const { productId } = request.params as { productId: string };
    const { shop, token } = request.query as { shop?: string; token?: string };
    const product = await productService.getProduct(shop ?? '', token ?? '', productId);
    if (!product) return reply.status(404).send({ error: 'Product not found' });
    return reply.send(product);
  });
}
