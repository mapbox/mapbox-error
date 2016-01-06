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
        logger.error(err);
        err.message = 'Internal Server Error';
    }

    var data;
    if (typeof err.message === 'object') {
        data = err.message;
    } else {
        data = { message: err.message };

        // For non-500 ErrorHTTP objects without own message body we send over any additional keys.
        // This error is one that we crafted ourselves deliberately for
        // public consumption.
        if (err instanceof ErrorHTTP && err.status < 500) {
            for (var k in err) {
                if (k === 'status') continue;
                data[k] = err[k];
            }
        }
    }

    res.status(err.status).jsonp(data);
    next();
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

    Error.call(this, typeof message === 'object' ? message.message : message);
    Error.captureStackTrace(this, arguments.callee);
    this.message = message;
    this.status = status;
}

ErrorHTTP.prototype = Object.create(Error.prototype);
