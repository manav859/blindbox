import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../errors/index.js';
import { logger } from '../logger/index.js';

export function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.issues,
    });
  }

  // Known application errors
  if (error instanceof AppError) {
    if (!error.isOperational) {
      logger.fatal({ err: error }, 'Non-operational error');
    }
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
    });
  }

  // Fastify-native validation errors
  if ('validation' in error && error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: error.message,
    });
  }

  // Unknown / unexpected errors
  logger.error({ err: error }, 'Unhandled error');
  return reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
}
