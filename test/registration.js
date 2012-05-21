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
    var persistence = {
      'name': 'test',
      'initialize': function () {},
      'restore': function () {},
      'insert': function () { counter += 1; },
      'flush': function (cb) { cb(); },
      'retrieve': function (cb) { cb(); },
    };
    cardinality.register(persistence);
    var set = new cardinality.set({'persistence': 'test'});
    for (var i = 0; i < 10000; i++) {
      set.add(i.toString() + 'abcdef' + (10000 - i).toString());
    }
    console.log(counter);
    assert(counter === 10000);
    return done();
  });
});