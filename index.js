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

    var data = { message:err.message };

    // For non-500 ErrorHTTP objects send over any additional keys.
    // This error is one that we crafted ourselves deliberately for
    // public consumption.
    if (err instanceof ErrorHTTP && err.status < 500) {
        for (var k in err) {
            if (k === 'status') continue;
            data[k] = err[k];
        }
    }

    res.jsonp(err.status, data);
}

function notFound(req, res, next) {
    next(new ErrorHTTP(404));
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
