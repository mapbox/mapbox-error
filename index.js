'use strict';

const logger = require('fastlog')();
const http = require('http');
const util = require('util');

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

function fastErrorHTTP(code, status) {
  if (typeof code !== 'string' && typeof code !== 'number') {
    throw new Error('code is required to be a string or number');
  }

  class FastErrorHTTP extends ErrorHTTP {
    constructor(...params) {
      const message = util.format(...params);
      super(message, status);
      this.code = code;
    }
  }

  return FastErrorHTTP;
}

function showError(err, req, res) {
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

function notFound(req, res, next) {
  next(new ErrorHTTP(404));
}

module.exports = { showError, notFound, fastErrorHTTP, ErrorHTTP };
