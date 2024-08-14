import { vi, it, expect } from 'vitest';
import { showError, notFound, ErrorHTTP } from '../src';

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