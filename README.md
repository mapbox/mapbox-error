[![Build Status](https://travis-ci.org/mapbox/mapbox-error.svg)](https://travis-ci.org/mapbox/mapbox-error)

### Generic error middleware for express.js apps

#### usage:
``` javascript
const errors = require('@mapbox/mapbox-error');
const ErrorHTTP = errors.ErrorHTTP;
const server = require('express')();

// use ErrorHTTP to associate a status code and message to an Error object
server.get('/error', (req, res, next) => {
  return next(new ErrorHTTP('Error for the sake of errors', 400));
});

// put these after other routes and uses have been defined
server.use(errors.showError);
server.use(errors.notFound);
```

#### test:

`npm test`
test
