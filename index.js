var logger = require('fastlog')();

module.exports = {};
module.exports.showError = showError;
module.exports.notFound = notFound;

function showError(err, req, res, next) {
    err.status = err.status || 500;

    // Output unexpected errors to console but hide them from public eyes.
    if (err.status >= 500) {
        if (process.env.NODE_ENV != 'test') {
            err.url = req.url;
            err.method = req.method;
            err['x-amz-cf-id'] = req.headers['x-amz-cf-id'];
            logger.error(err);
        }
        if (process.env.NODE_ENV == 'production') err.message = 'Internal Server Error';
    }

    res.jsonp(err.status, {message: err.message});
}

function notFound(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
}