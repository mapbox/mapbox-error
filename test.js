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

tape('showError', function(t) {
    var logged = 0;
    var status;
    var data;

    var req = new MockReq();
    var res = new MockRes();
    res.jsonp = function(s, d) {
        status = s;
        data = d;
    };

    var origlog = console.log;
    console.log = function() { logged++; };
    errors.showError(new Error('fatal'), req, res, function(){});
    console.log = origlog;


    t.equal(logged, 1, 'message logged');
    t.equal(status, 500);
    t.deepEqual(data, { message: 'Internal Server Error' });

    t.end();
});

tape('showError - not 500', function(t) {
    var logged = 0;
    var status;
    var data;

    var req = new MockReq();
    var res = new MockRes();
    res.jsonp = function(s, d) {
        status = s;
        data = d;
    };

    var err = {
        message: 'Tileset does not exist',
        status: 404
    };
    var origlog = console.log;
    console.log = function() { logged++; };
    errors.showError(err, req, res, function(){});
    console.log = origlog;

    t.equal(logged, 0, 'message not logged');
    t.equal(status, 404);
    t.deepEqual(data, { message: 'Tileset does not exist' });

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
