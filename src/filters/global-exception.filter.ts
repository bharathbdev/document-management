import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseMessage = exception.getResponse();

      // Handle validation errors from ValidationPipe
      if (exception instanceof BadRequestException && typeof responseMessage === 'object') {
        const validationErrors = (responseMessage as any).message;
        message = Array.isArray(validationErrors) ? validationErrors.join(', ') : validationErrors;
        code = 'ValidationError';
      } else {
        message = typeof responseMessage === 'string' ? responseMessage : (responseMessage as any).message;
        code = 'HttpException';
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }
}
