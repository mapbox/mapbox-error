var logger = require('fastlog')();
var http = require('http');

module.exports = {};
module.exports.showError = showError;
module.exports.notFound = notFound;
module.exports.ErrorHTTP = ErrorHTTP;

function showError(err, req, res, next) {
    err.status = err.status || 500;

    // Output unexpected errors to console but hide them from public eyes.
    if (err.status >= 500) {
        err.url = req.url;
        err.method = req.method;
        err['x-amz-cf-id'] = req.headers['x-amz-cf-id'];
        logger.error(err);
        err.message = 'Internal Server Error';
    }

    res.jsonp(err.status, {message: err.message});
}

function notFound(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
}

function ErrorHTTP(message, status) {
    if (typeof message === 'number') {
        status = message;
        message = null;
    }
    if (!message) {
        message = http.STATUS_CODES[status] || 'Unknown';
    }

    Error.call(this, message);
    Error.captureStackTrace(this, arguments.callee);
    this.message = message;
    this.status = status;
}

ErrorHTTP.prototype = Object.create(Error.prototype);