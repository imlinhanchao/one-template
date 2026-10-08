import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);
  private readonly methods = new Set(['POST', 'PUT', 'DELETE']);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: { userId?: string } }>();
    const method = req?.method?.toUpperCase();

    if (!method || !this.methods.has(method)) {
      return next.handle();
    }

    const start = Date.now();
    const path = req.originalUrl || req.url;
    const userId = req.user?.userId || '';

    return next.handle().pipe(
      tap({
        next: () => {
          const res = http.getResponse<{ statusCode?: number }>();
          this.logger.log(
            JSON.stringify({
              method,
              path,
              userId,
              statusCode: res?.statusCode || 200,
              durationMs: Date.now() - start,
            }),
          );
        },
        error: (error: unknown) => {
          const res = http.getResponse<{ statusCode?: number }>();
          this.logger.warn(
            JSON.stringify({
              method,
              path,
              userId,
              statusCode: res?.statusCode,
              durationMs: Date.now() - start,
              error: error instanceof Error ? error.message : String(error),
            }),
          );
        },
      }),
    );
  }
}
