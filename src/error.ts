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
      this.message = STATUS_CODES[this.status] || `Unknown status ${this.status}`;
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
export function customErrorHTTP(code: string | number, status?: number) {
  if (typeof code !== 'string' && typeof code !== 'number') {
    throw new Error('code is required to be a string or number');
  }

  return class extends ErrorHTTP {
    code: string | number;

    constructor(...args: any) {
      const message = format(...args);
      super(message, status);
      this.code = code;
    }
  }
}
