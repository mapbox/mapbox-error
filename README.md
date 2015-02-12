[![Build Status](https://travis-ci.org/mapbox/mapbox-error.svg)](https://travis-ci.org/mapbox/mapbox-error)

### Generic error middleware for express apps

#### usage:
``` javascript
var errors = require('mapbox-error');
var server = require('express')();

// use ErrorHTTP to associate a status code and message to an Error object
server.get('/error', function(req, res, next) {
  return next(new errors.ErrorHTTP(400, 'Error for the sake of errors');
});

// put these after other routes and uses have been defined
server.use(errors.showError);
server.use(errors.notFound);

```

#### test:

`npm test`
