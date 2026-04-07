import type { FastifyInstance } from 'fastify';
import { blindBoxConfigService } from './blind-box-config.service.js';
import {
  createBlindBoxSchema,
  updateBlindBoxSchema,
  createPoolItemSchema,
  updatePoolItemSchema,
} from './blind-box-config.schema.js';

export async function blindBoxConfigRoutes(app: FastifyInstance) {
  // ───── Blind Box ─────

  app.get('/', async (request, reply) => {
    const { shopId } = request.query as { shopId?: string };
    const boxes = await blindBoxConfigService.list(shopId);
    return reply.send(boxes);
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const box = await blindBoxConfigService.getById(id);
    return reply.send(box);
  });

  app.post('/', async (request, reply) => {
    const data = createBlindBoxSchema.parse(request.body);
    const box = await blindBoxConfigService.create(data);
    return reply.status(201).send(box);
  });

  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = updateBlindBoxSchema.parse(request.body);
    const box = await blindBoxConfigService.update(id, data);
    return reply.send(box);
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await blindBoxConfigService.remove(id);
    return reply.status(204).send();
  });

  // ───── Pool Items ─────

  app.post('/:id/items', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = createPoolItemSchema.parse(request.body);
    const item = await blindBoxConfigService.addItem(id, data);
    return reply.status(201).send(item);
  });

  app.put('/items/:itemId', async (request, reply) => {
    const { itemId } = request.params as { itemId: string };
    const data = updatePoolItemSchema.parse(request.body);
    const item = await blindBoxConfigService.updateItem(itemId, data);
    return reply.send(item);
  });

  app.delete('/items/:itemId', async (request, reply) => {
    const { itemId } = request.params as { itemId: string };
    await blindBoxConfigService.removeItem(itemId);
    return reply.status(204).send();
  });
}
