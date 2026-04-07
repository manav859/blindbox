import type { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../logger/index.js';

export function requestLogger(request: FastifyRequest, _reply: FastifyReply, done: () => void) {
  logger.info({ method: request.method, url: request.url, id: request.id }, 'Incoming request');
  done();
}
