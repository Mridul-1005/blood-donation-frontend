// core/interceptors/timeout-interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { timeout, catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

const DEFAULT_TIMEOUT = 15000; // 15 seconds

export const timeoutInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const timeoutValue = req.headers.get('X-Timeout') ? parseInt(req.headers.get('X-Timeout')!, 10) : DEFAULT_TIMEOUT;

  return next(req).pipe(
    timeout(timeoutValue),
    catchError((error) => {
      if (error.name === 'TimeoutError') {
        const errorResponse = new HttpErrorResponse({
          url: req.url,
          status: 504,
          statusText: 'Gateway Timeout',
          error: { message: `Request to ${req.url} timed out after ${timeoutValue}ms` }
        });
        return throwError(() => errorResponse);
      }
      return throwError(() => error);
    })
  );
};