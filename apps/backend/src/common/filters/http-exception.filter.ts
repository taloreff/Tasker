import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        status = exception.getStatus();
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        // Most NestJS exceptions return { statusCode, message, ... }
        const obj = res as any;
        status = obj.statusCode ?? exception.getStatus();
        message = obj.message ?? exception.message;
      } else {
        status = exception.getStatus();
        message = exception.message;
      }
      
      // Log HTTP exceptions (client errors)
      if (status >= 400 && status < 500) {
        this.logger.warn(`HTTP ${status}: ${message} - Path: ${request?.url}`);
      } else {
        this.logger.error(`HTTP ${status}: ${message} - Path: ${request?.url}`);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled Error: ${message} - Path: ${request?.url}`, exception.stack);
    } else {
      this.logger.error(`Unknown exception: ${JSON.stringify(exception)} - Path: ${request?.url}`);
    }

    response?.status?.(status)?.json?.({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request?.url ?? '',
    });
  }
}