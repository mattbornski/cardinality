/* Mocha test
   to use:
     npm install mocha
     mocha <filename>
   or
     npm test
*/

var assert = require('assert');
var cardinality = require('../lib/index');

describe('Mechanism registration', function () {
  it('should accept well formed persistence mechanisms', function (done) {
    // N.B. while this persistence mechanism implements the interface
    // correctly it irrevocably damages the data; do not use for anything
    // but this test.
    var counter = 0;
    var M = [];
    var persistence = {
      'name': 'test',
      'create': function (b, s, cb) { for (var i = 0; i < b; i++) { M.push(63); }; cb(null, {}); },
      'restore': function (state, s, cb) { cb(null, {}); },
      'insert': function (state, j, v, cb) { counter += 1; cb(); },
      'represent': function (state, cb) { cb(null, {'M': M, 'count': counter}); },
    };
    cardinality.register(persistence);
    var set = new cardinality.set({'persistence': 'test'});
    for (var i = 0; i < 10000; i++) {
      set.add(i.toString() + 'abcdef' + (10000 - i).toString());
    }
    console.log(counter);
    assert(counter === 10000);
    set.size(function (error, size) {
      console.log(M);
      console.log(size);
      if (error) {
        return done(error);
      }
      assert(size === 10000);
      return done();
    });
  });
});