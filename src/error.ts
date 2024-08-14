import { STATUS_CODES } from 'node:http';
import { format } from 'node:util';

/**
 * Base HTTP error class built with a message and a status code
 * @extends Error
 */
export class ErrorHTTP extends Error {
  status: number;

  constructor(message?: string | number, status: number = 500) {
    super();

    if (!message) {
      this.status = status;
      this.message = STATUS_CODES[status] as string;
    } else if (typeof message === 'number') {
      this.status = message;
      this.message = STATUS_CODES[this.status] as string;
    } else {
      this.message = message;
      this.status = status;
    }

    Error.call(this, this.message);
    Error.captureStackTrace(this, ErrorHTTP);
  }
}

/**
 * Generates a custom error object used for specific error handling.
 * Extends the ErrorHTTP class.
 *
 * @param {String} code - error code you want to use, ex: RateLimitError
 * @param {Number} status - the HTTP status code you want this error to throw
 * @extends ErrorHTTP
 * @returns {Class} - an error handling class
 */
export function fastErrorHTTP(code: string, status?: number) {
  if (typeof code !== 'string' && typeof code !== 'number') {
    throw new Error('code is required to be a string or number');
  }

  return class extends ErrorHTTP {
    code: string;

    constructor(...args: any) {
      const message = format(...args);
      super(message, status);
      this.code = code;
    }
  }
}

/* test */
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('ErrorHTTP', () => {
    const defaultErrorHTTP = new ErrorHTTP();
    expect(defaultErrorHTTP.status).toBe(500);
    expect(defaultErrorHTTP.message).toBe('Internal Server Error');
    expect(defaultErrorHTTP.stack).toContain('Error: Internal Server Error');

    const statusAsMessage = new ErrorHTTP(404);
    expect(statusAsMessage.status).toBe(404);
    expect(statusAsMessage.message).toBe('Not Found');
    expect(statusAsMessage.stack).toContain('Error: Not Found');

    const messageAndStatus = new ErrorHTTP('Wrongo', 401);
    expect(messageAndStatus.status).toBe(401);
    expect(messageAndStatus.message).toBe('Wrongo');
    expect(messageAndStatus.stack).toContain('Error: Wrongo');
  });

  it('FastErrorHTTP', () => {
    expect(() => {
      (fastErrorHTTP as any)();
    }).toThrowError(/code is required to be a string or number/);
    expect(() => {
      (fastErrorHTTP as any)(function() {});
    }).toThrowError(/code is required to be a string or number/);

    const CustomErrorType = fastErrorHTTP('MyCustomErrorTypeCode', 401);
    const defaultErrorHTTP = new CustomErrorType();
    expect(defaultErrorHTTP.code).toBe('MyCustomErrorTypeCode');
    expect(defaultErrorHTTP.status).toBe(401);
    expect(defaultErrorHTTP.message).toBe('Unauthorized');
    expect(defaultErrorHTTP.stack).toContain('Error: Unauthorized');

    // @ts-ignore
    const statusAsMessage = new CustomErrorType(404);
    expect(statusAsMessage.code).toBe('MyCustomErrorTypeCode');
    expect(statusAsMessage.status).toBe(401);
    expect(statusAsMessage.message).toBe('404');
    expect(defaultErrorHTTP.stack).toContain('Error: Unauthorized');

    const messageErrorHTTP = new CustomErrorType('something custom happened');
    expect(messageErrorHTTP.code).toBe('MyCustomErrorTypeCode');
    expect(messageErrorHTTP.status).toBe(401);
    expect(messageErrorHTTP.message).toBe('something custom happened');
    expect(messageErrorHTTP.stack).toContain('Error: something custom happened');

    const ServerError = fastErrorHTTP('CustomServerError');
    const defaultServerError = new ServerError();
    expect(defaultServerError.code).toBe('CustomServerError');
    expect(defaultServerError.status).toBe(500);
    expect(defaultServerError.message).toBe('Internal Server Error');
    expect(defaultServerError.stack).toContain('Error: Internal Server Error');

    const messaageServerError = new ServerError('[%s:%s:%s] bar', 'foo', 'baz', 'bang');
    expect(messaageServerError.code).toBe('CustomServerError');
    expect(messaageServerError.status).toBe(500);
    expect(messaageServerError.message).toBe('[foo:baz:bang] bar');
    expect(messaageServerError.stack).toContain('Error: [foo:baz:bang] bar');
  });
}
