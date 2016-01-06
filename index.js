var logger = require('fastlog')();
var http = require('http');

module.exports = {};
module.exports.showError = showError;
module.exports.notFound = notFound;
module.exports.ErrorHTTP = ErrorHTTP;

function showError(err, req, res, next) {
    err.http_status = err.http_status || 500;

    // Output unexpected errors to console but hide them from public eyes.
    if (err.http_status >= 500) {
        err.url = req.url;
        err.method = req.method;
        logger.error(err);
        err.message = 'Internal Server Error';
    }

    var data = { message:err.message };

    // For non-500 ErrorHTTP objects send over any additional keys.
    // This error is one that we crafted ourselves deliberately for
    // public consumption.
    if (err instanceof ErrorHTTP && err.http_status < 500) {
        for (var k in err) {
            if (k === 'http_status') continue;
            data[k] = err[k];
        }
    }

    res.status(err.http_status).jsonp(data);
    next();
}

function notFound(req, res, next) {
    next(new ErrorHTTP(404));
}

function ErrorHTTP(message, http_status) {
    if (typeof message === 'number') {
        http_status = message;
        message = null;
    }
    http_status = http_status || 500;
    if (!message) {
        message = http.STATUS_CODES[http_status];
    }

    Error.call(this, message);
    Error.captureStackTrace(this, arguments.callee);
    this.message = message;
    this.http_status = http_status;
}

ErrorHTTP.prototype = Object.create(Error.prototype);
