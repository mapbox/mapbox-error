[![Run tests](https://github.com/mapbox/mapbox-error/actions/workflows/test.yml/badge.svg)](https://github.com/mapbox/mapbox-error/actions/workflows/test.yml)

# @mapbox/mapbox-error

Generic error middleware for express.js apps.

### usage

Install

```
npm i @mapbox/mapbox-error
```

Example application

```js
import { showError, notFound, ErrorHTTP } from '@mapbox/mapbox-error';
import { express } from 'express';

const server = express();

// use ErrorHTTP to associate a status code and message to an Error object
server.get('/error', (req, res, next) => {
  return next(new ErrorHTTP('Error for the sake of errors', 400));
});

// put these after all routes have been loaded
server.use(showError());
server.use(notFound());
```

You can create and re-use error classes

```js
import { customErrorHTTP } from '@mapbox/mapbox-error';

const InvalidToken = customErrorHTTP('InvalidToken', 401);

// within an express middleware...
next(new InvalidToken());
```

### develop

```sh
npm ci          # install deps
npm run build   # build project
npm test        # run tests
npm run lint    # lint
```
