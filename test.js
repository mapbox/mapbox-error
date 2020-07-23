'use strict';

const tape = require('tape');
const errors = require('./index');

function MockReq() {
  this.query = {};
  this.headers = {};
}
function MockRes() {
  this.headers = {};
}

MockRes.prototype.set = function(k,v) { this.headers[k] = v; };
MockRes.prototype.json = function() {};
MockRes.prototype.status = function(s) {
  this.status = s;
  return this;
};
MockRes.prototype.jsonp = function(d) {
  this.data = d;
  return this;
};

tape('showError', (t) => {
  let logged = 0;

  const req = new MockReq();
  const res = new MockRes();
  const next = function () {};

  const origlog = console.log;
  console.log = function() { logged++; };
  errors.showError(new Error('fatal'), req, res, next, () => {});
  console.log = origlog;

  t.equal(logged, 1, 'message logged');
  t.equal(res.status, 500);
  t.deepEqual(res.data, { message: 'Internal Server Error' });

  t.end();
});

tape('showError - not 500', (t) => {
  let logged = 0;

  const req = new MockReq();
  const res = new MockRes();
  const next = function () {};

  const err = {
    message: 'Tileset does not exist',
    status: 404
  };
  const origlog = console.log;
  console.log = function() { logged++; };
  errors.showError(err, req, res, next, () => {});
  console.log = origlog;

  t.equal(logged, 0, 'message not logged');
  t.equal(res.status, 404);
  t.deepEqual(res.data, { message: 'Tileset does not exist' });

  t.end();
});

tape('showError - ErrorHTTP with 404 status property with extra properties', (t) => {
  let logged = 0;

  const req = new MockReq();
  const res = new MockRes();
  const next = function () {};

  const err = new errors.ErrorHTTP('Tileset does not exist', 404);
  err.details = 'here are the details';
  const origlog = console.log;
  console.log = function() { logged++; };
  errors.showError(err, req, res, next, () => {});
  console.log = origlog;

  t.equal(logged, 0, 'message not logged');
  t.equal(res.status, 404);
  t.deepEqual(res.data, { message: 'Tileset does not exist', details: 'here are the details' });

  t.end();
});

tape('showError - ErrorHTTP with 403 status with custom TTL', (t) => {
  const req = new MockReq();
  const res = new MockRes();
  const next = function () {};

  const err = new errors.ErrorHTTP('I forbid it', 403);
  errors.showError(err, req, res, next, 'max-age=10000,s-maxage=10000');

  t.equal(res.status, 403);
  t.equal(res.headers['Cache-Control'], 'max-age=10000,s-maxage=10000');
  t.end();
});

tape('notFound', (t) => {
  const req = new MockReq();
  const res = new MockRes();

  errors.notFound(req, res, (err) => {
    t.equal(err.status, 404);
    t.deepEqual(err.message, 'Not Found');
    t.end();
  });
});

tape('fastErrorHTTP', (t) => {
  const PreconfitionFailed = errors.fastErrorHTTP('PreconfitionFailed', 422);
  const ServerError = errors.fastErrorHTTP('ServerError');

  let err = new PreconfitionFailed('input field expected');
  t.equal(err.message, 'input field expected', 'sets message');
  t.equal(err.code, 'PreconfitionFailed', 'sets code');
  t.equal(err.status, 422, 'sets status code');
  t.ok(err.stack, 'has stack trace');
  t.ok(err instanceof PreconfitionFailed);
  t.ok(err instanceof errors.ErrorHTTP);

  err = new PreconfitionFailed();
  t.equal(err.message, 'Unprocessable Entity', 'sets message based on status code');
  t.equal(err.code, 'PreconfitionFailed', 'sets code');
  t.equal(err.status, 422, 'sets status code');
  t.ok(err.stack, 'has stack trace');
  t.ok(err instanceof PreconfitionFailed);
  t.ok(err instanceof errors.ErrorHTTP);

  err = new ServerError('Server error');
  t.equal(err.message, 'Server error', 'sets message');
  t.equal(err.code, 'ServerError', 'sets code');
  t.equal(err.status, 500, 'status defaults to 500');
  t.ok(err.stack, 'has stack trace');
  t.ok(err instanceof ServerError);
  t.ok(err instanceof errors.ErrorHTTP);

  err = new ServerError();
  t.equal(err.message, 'Internal Server Error', 'sets message based on status code');
  t.equal(err.code, 'ServerError', 'sets code');
  t.equal(err.status, 500, 'status defaults to 500');
  t.ok(err.stack, 'has stack trace');
  t.ok(err instanceof ServerError);
  t.ok(err instanceof errors.ErrorHTTP);

  err = new ServerError('[%s] bar', 'foo');
  t.equal(err.message, '[foo] bar', 'expands message');
  t.equal(err.code, 'ServerError', 'sets code');
  t.equal(err.status, 500, 'status defaults to 500');
  t.ok(err.stack, 'has stack trace');
  t.ok(err instanceof ServerError);
  t.ok(err instanceof errors.ErrorHTTP);

  t.equal(Object.getPrototypeOf(err).toString(), 'Error', 'inherits from Error');

  t.end();
});

tape('ErrorHTTP', (t) => {
  let err = new errors.ErrorHTTP('Testing error', 500);
  t.equal(err.message, 'Testing error', 'sets message');
  t.equal(err.status, 500, 'sets status code');
  t.ok(err.stack, 'has stack trace');

  err = new errors.ErrorHTTP(404);
  t.equal(err.message, 'Not Found', 'sets message based on status code');
  t.equal(err.status, 404, 'sets status');
  t.equal(err.ttl, undefined, 'no default ttl');

  err = new errors.ErrorHTTP('Server error');
  t.equal(err.message, 'Server error', 'sets message');
  t.equal(err.status, 500, 'status defaults to 500');

  err = new errors.ErrorHTTP();
  t.equal(err.message, 'Internal Server Error', 'sets message');
  t.equal(err.status, 500, 'status defaults to 500');
  t.equal(err.ttl, undefined, 'no default ttl');

  err = new errors.ErrorHTTP('Custom cache error', 410, 'max-age=4200,s-maxage=4200');
  t.equal(err.message, 'Custom cache error', 'sets message');
  t.equal(err.status, 410, 'sets status');
  t.equal(err.ttl, 'max-age=4200,s-maxage=4200', 'sets custom cache');

  t.equal(Object.getPrototypeOf(err).toString(), 'Error', 'inherits from Error');

  t.end();
});
