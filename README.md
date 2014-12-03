[![Build Status](https://magnum.travis-ci.com/mapbox/atlas-server.svg?token=hLpUd9oZwpjSs5JzfqFa&branch=master)](https://magnum.travis-ci.com/mapbox/mapbox-error.svg?token=7y8zxnPkFHgvCBr6YJaA)

### Generic error middleware for express apps

#### usage:
``` javascript
var errors = require('mapbox-error');
var server = require('express')();

// put these after other routes and uses have been defined
server.use(errors.showError);
server.use(errors.notFound);

```

#### test:

`npm test`