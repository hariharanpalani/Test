import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

/** Maps opossum's open-circuit and timeout errors to 503; everything else goes to Nest's default handling. */
@Catch()
export class BreakerOpenFilter extends BaseExceptionFilter implements ExceptionFilter {
  catch(err: unknown, host: ArgumentsHost) {
    const code = (err as { code?: string })?.code;
    if (!(err instanceof HttpException) && (code === 'EOPENBREAKER' || code === 'ETIMEDOUT')) {
      const res = host.switchToHttp().getResponse<Response>();
      res.status(503).json({
        statusCode: 503,
        message: code === 'EOPENBREAKER' ? 'Upstream circuit open, try again later' : 'Upstream timed out',
        code,
      });
      return;
    }
    super.catch(err, host);
  }
}
