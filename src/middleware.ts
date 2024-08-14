import type { Request, Response, NextFunction } from 'express';
import { ErrorHTTP } from './error';

export interface ShowErrorOptions {
  logger?: Function,
}

/**
 * An express.js middleware used for showing errors in your logs
 * and converting them to JSONP enabled response messages.
 *
 * It will log any >=500 status codes using console.error or a custom
 * logger and update the error message to "Internal Server Error" to 
 * obfuscate any stack or native-level errors that you don't want 
 * to expose to users.
 *
 * Any status codes <500 are assumed to contain error messages crafted
 * for public consumption.
 * @param {Object} options - Options for the middleware
 * @param {Function} options.logger Custom logger function for logging the errors
 * defaults to console.error
 */
export function showError(options?: ShowErrorOptions) {
  const logger = options?.logger || console.error;
  
  // NOTE: next is needed, even if not used, per https://expressjs.com/en/guide/using-middleware.html
  return function(err: any, req: Request, res: Response, next: NextFunction) { // eslint-disable-line no-unused-vars
    err.status = err.status || 500;
  
    // Output unexpected errors to console but hide them from public eyes.
    if (err.status >= 500) {
      err.url = req.url;
      err.method = req.method;
      logger(err);
      err.message = 'Internal Server Error';
    }
  
    const data: Record<string, any> = { 
      message: err.message
    };
  
    // For non-500 ErrorHTTP objects send over any additional keys.
    // This error is one that we crafted ourselves deliberately for
    // public consumption.
    if (err instanceof ErrorHTTP && err.status < 500) {
      for (const k in err) {
        if (k === 'status') continue;
        data[k] = (err as any)[k];
      }
    }
  
    res.status(err.status).jsonp(data);
  }
} 

/**
 * Express.js middleware for properly assigning a 404 status code for
 * any resources not found.
 *
 */
export function notFound() {
  return function(req: Request, res: Response, next: NextFunction) {
    next(new ErrorHTTP(404));
  }
}

/* test */
if (import.meta.vitest) {
  const { vi, it, expect } = import.meta.vitest;

  const mockResponse = {
    status: vi.fn().mockImplementation(function() {
      return mockResponse;
    }),
    jsonp: vi.fn()
  };

  it('showError, default', () => {
    vi.spyOn(console, 'error');
    const mockNext = vi.fn();
    const mockRequest = {
      url: 'http://example/route',
      method: 'GET'
    };
    const err = new ErrorHTTP('test error');

    const middleware = showError();
    middleware(err, mockRequest as any, mockResponse as any, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.jsonp).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect(console.error).toHaveBeenCalledWith(err);
  });

  it('showError, options.logger', () => {
    const mockNext = vi.fn();
    const mockRequest = {
      url: 'http://api.example/route',
      method: 'GET'
    };
    const err = new ErrorHTTP('test error');
    const logger = vi.fn();

    const middleware = showError({ logger });
    middleware(err, mockRequest as any, mockResponse as any, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.jsonp).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect((err as any).url).toBe('http://api.example/route');
    expect((err as any).method).toBe('GET');
    expect(logger).toHaveBeenCalledWith(err);
  });

  it('showError, not ErrorHTTP', () => {
    const mockNext = vi.fn();
    const mockRequest = {
      url: 'http://api.example/route',
      method: 'GET'
    };
    const err = new TypeError('bad type');

    const middleware = showError();
    middleware(err, mockRequest as any, mockResponse as any, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.jsonp).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
    expect((err as any).url).toBe('http://api.example/route');
    expect((err as any).method).toBe('GET');
  });

  it('showError, non-500', () => {
    vi.spyOn(console, 'error');
    const mockNext = vi.fn();
    const mockRequest = {
      url: 'http://api.example/route',
      method: 'GET'
    };
    const err = new ErrorHTTP('uh oh', 401);

    const middleware = showError();
    middleware(err, mockRequest as any, mockResponse as any, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.jsonp).toHaveBeenCalledWith({
      message: 'uh oh'
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('notFound', () => {
    const mockNext = vi.fn();
    const mockRequest = {
      url: 'http://api.example/route',
      method: 'GET'
    };

    const middleware = notFound();
    middleware(mockRequest as any, mockResponse as any, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new ErrorHTTP(404));
  });
}