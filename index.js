var logger = require('fastlog')();
var http = require('http');

module.exports = {};
module.exports.showError = showError;
module.exports.notFound = notFound;
module.exports.ErrorHTTP = ErrorHTTP;

function showError(err, req, res, next) {
    err.status = err instanceof ErrorHTTP ? err.status : 500;

    // Output unexpected errors to console but hide them from public eyes.
    if (err.status >= 500) {
        err.url = req.url;
        err.method = req.method;
        logger.error(err);
        err.message = 'Internal Server Error';
    }

    res.jsonp(err.status, {message: err.message});
}

function notFound(req, res, next) {
    next(new ErrorHTTP(404));
}

function ErrorHTTP(message, status) {
    if (typeof message === 'number') {
        status = message;
        message = null;
    }
    status = status || 500;
    if (!message) {
        message = http.STATUS_CODES[status];
    }

    Error.call(this, message);
    Error.captureStackTrace(this, arguments.callee);
    this.message = message;
    this.status = status;
}

ErrorHTTP.prototype = Object.create(Error.prototype);
