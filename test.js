var tape = require('tape');
var errors = require('./index');

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

tape('showError', function(t) {
    var logged = 0;

    var req = new MockReq();
    var res = new MockRes();

    var origlog = console.log;
    console.log = function() { logged++; };
    errors.showError(new Error('fatal'), req, res, function(){});
    console.log = origlog;


    t.equal(logged, 1, 'message logged');
    t.equal(res.status, 500);
    t.deepEqual(res.data, { message: 'Internal Server Error' });

    t.end();
});

tape('showError - not 500', function(t) {
    var logged = 0;

    var req = new MockReq();
    var res = new MockRes();

    var err = {
        message: 'Tileset does not exist',
        status: 404
    };
    var origlog = console.log;
    console.log = function() { logged++; };
    errors.showError(err, req, res, function(){});
    console.log = origlog;

    t.equal(logged, 0, 'message not logged');
    t.equal(res.status, 404);
    t.deepEqual(res.data, { message: 'Tileset does not exist' });

    t.end();
});

tape('showError - ErrorHTTP with 404 status property with extra properties', function(t) {
    var logged = 0;

    var req = new MockReq();
    var res = new MockRes();

    var err = new errors.ErrorHTTP('Tileset does not exist', 404);
    err.details = 'here are the details';
    var origlog = console.log;
    console.log = function() { logged++; };
    errors.showError(err, req, res, function(){});
    console.log = origlog;

    t.equal(logged, 0, 'message not logged');
    t.equal(res.status, 404);
    t.deepEqual(res.data, { message: 'Tileset does not exist', details: 'here are the details' });

    t.end();
});

tape('notFound', function(t) {
    var req = new MockReq();
    var res = new MockRes();

    errors.notFound(req, res, function(err) {
        t.equal(err.status, 404);
        t.deepEqual(err.message, 'Not Found');
        t.end();
    });
});

tape('ErrorHTTP', function(t) {
    var err = new errors.ErrorHTTP('Testing error', 500);
    t.equal(err.message, 'Testing error', 'sets message');
    t.equal(err.status, 500, 'sets status code');
    t.ok(err.stack, 'has stack trace');

    var err = new errors.ErrorHTTP({ message: 'Testing error', details: 'more details' }, 500);
    t.deepEqual(err.message, { message: 'Testing error', details: 'more details' }, 'sets message object');
    t.equal(err.status, 500, 'sets status code');
    t.ok(err.stack, 'has stack trace');

    err = new errors.ErrorHTTP(404);
    t.equal(err.message, 'Not Found', 'sets message based on status code');
    t.equal(err.status, 404, 'sets status');

    err = new errors.ErrorHTTP('Server error');
    t.equal(err.message, 'Server error', 'sets message');
    t.equal(err.status, 500, 'status defaults to 500');

    err = new errors.ErrorHTTP();
    t.equal(err.message, 'Internal Server Error', 'sets message');
    t.equal(err.status, 500, 'status defaults to 500');

    t.equal(Object.getPrototypeOf(err).toString(), 'Error', 'inherits from Error');

    t.end();
});
