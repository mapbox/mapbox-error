[![Build Status](https://travis-ci.org/mapbox/mapbox-error.svg)](https://travis-ci.org/mapbox/mapbox-error)

### Generic error middleware for express apps

#### Usage

``` javascript
var errors = require('mapbox-error');
var ErrorHTTP = errors.ErrorHTTP;
var server = require('express')();

// use ErrorHTTP to associate a status code and message to an Error object
//
// To the user this will return:
//   HTTP/1.1 400 Bad request
//   {"message":"Error for the sake of errors"}
server.get('/error', function(req, res, next) {
  return next(new ErrorHTTP('Error for the sake of errors', 400);
});

// use ErrorHTTP to associate a status code and message object to an Error object
// To the user this will return:
//   HTTP/1.1 400 Bad request
//   {"message":"Error for the sake of errors","status":"GOOD_ERRORS_ARE_GOOD"}
server.get('/error', function(req, res, next) {
  return next(new ErrorHTTP({
    message: 'Error for the sake of errors',
    status: 'GOOD_ERRORS_ARE_GOOD'
  }, 400);
});

// put these after other routes and uses have been defined
server.use(errors.showError);
server.use(errors.notFound);
```

#### Tests

`npm test`
