import type { FastifyInstance } from 'fastify';
import { assignmentService } from './assignment.service.js';

export async function assignmentRoutes(app: FastifyInstance) {
  /**
   * GET /api/admin/assignments
   * List all assignments, optionally filtered by shopId.
   */
  app.get('/assignments', async (request, reply) => {
    const { shopId } = request.query as { shopId?: string };
    const assignments = await assignmentService.listAll({ shopId });
    return reply.send(assignments);
  });

  /**
   * GET /api/admin/blind-boxes/:id/assignments
   * List assignments for a specific blind box.
   */
  app.get('/blind-boxes/:id/assignments', async (request, reply) => {
    const { id } = request.params as { id: string };
    const assignments = await assignmentService.listByBlindBox(id);
    return reply.send(assignments);
  });
}
