'use strict';

const fastlogLogger = require('@mapbox/fastlog')();
const http = require('http');
const util = require('util');

/**
 * Base HTTP error class built with a message and a status code
 * @extends Error
 */
class ErrorHTTP extends Error {
  constructor(message, status = 500) {
    super();

    if (typeof message === 'number') {
      status = message;
      message = null;
    }

    if (!message) {
      message = http.STATUS_CODES[status];
    }

    Error.call(this, message);
    Error.captureStackTrace(this, ErrorHTTP);
    this.message = message;
    this.status = status;
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
function fastErrorHTTP(code, status) {
  if (typeof code !== 'string' && typeof code !== 'number') {
    throw new Error('code is required to be a string or number');
  }

  class FastErrorHTTP extends ErrorHTTP {
    constructor() {
      const message = util.format(...arguments);
      super(message, status);
      this.code = code;
    }
  }

  return FastErrorHTTP;
}

/**
 * Creates an express.js middleware used for showing errors in your logs
 * and converting them to JSONP enabled response messages.
 * 
 * The options object allows defining a custom logger for the middleware.
 *
 * It will log any >=500 status codes using fastlog and update the
 * error message to "Internal Server Error" to obfuscate any stack or
 * native-level errors that you don't want to expose to users.
 *
 * Any status codes <500 are assumed to contain error messages crafted
 * for public consumption.
 * @param {Object} options - Options for the middleware
 * @param {Object} options.logger Custom logger for logging the errors
 * @param {Function} options.logger.error
 */
function showErrorWithOptions(options = {}) {
  const logger = options.logger || fastlogLogger;

  if(!logger.error || typeof logger.error !== 'function'){
    throw new Error(`Logger must have property 'error' and it must be a function`)
  }
  
  // NOTE: next is needed, even if not used, per https://expressjs.com/en/guide/using-middleware.html
  return (err, req, res, next)  => { // eslint-disable-line no-unused-vars
    err.status = err.status || 500;
  
    // Output unexpected errors to console but hide them from public eyes.
    if (err.status >= 500) {
      err.url = req.url;
      err.method = req.method;
      logger.error(err);
      err.message = 'Internal Server Error';
    }
  
    const data = { message:err.message };
  
    // For non-500 ErrorHTTP objects send over any additional keys.
    // This error is one that we crafted ourselves deliberately for
    // public consumption.
    if (err instanceof ErrorHTTP && err.status < 500) {
      for (const k in err) {
        if (k === 'status') continue;
        data[k] = err[k];
      }
    }
  
    res.status(err.status).jsonp(data);
  }
} 

/**
 * An express.js middleware used for showing errors in your logs
 * and converting them to JSONP enabled response messages.
 *
 * It will log any >=500 status codes using fastlog and update the
 * error message to "Internal Server Error" to obfuscate any stack or
 * native-level errors that you don't want to expose to users.
 *
 * Any status codes <500 are assumed to contain error messages crafted
 * for public consumption.
 */
const showError = showErrorWithOptions({ logger: fastlogLogger });

/**
 * Express.js middleware for properly assigning a 404 status code for
 * any resources not found.
 *
 */
function notFound(req, res, next) {
  next(new ErrorHTTP(404));
}


module.exports = { showError, showErrorWithOptions, notFound, fastErrorHTTP, ErrorHTTP };
