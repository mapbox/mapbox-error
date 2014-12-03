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