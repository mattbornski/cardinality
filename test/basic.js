/* Mocha test
   to use:
     npm install mocha
     mocha <filename>
   or
     npm test
*/

var assert = require('assert');
var harness = require('./harness');
var cardinality = require('../lib/index');

describe('Log Log algorithm', function () {
  it('should estimate the cardinality of variously sized sets within 2% accuracy, faster than naive counting', function (done) {
    var sizes = [
      100,
      10000,
      1000000,
      10000000,
    ];
    var results = harness.compare(harness.naiveCardinality, cardinality.LogLog, sizes);
    console.log('LogLog');
    console.log(results);
    return done();
  });
});

describe('Hyper Log Log algorithm', function () {
  it('should estimate the cardinality of variously sized sets within 2% accuracy, faster than naive counting', function (done) {
    var sizes = [
      100,
      10000,
      1000000,
      10000000,
    ];
    var results = harness.compare(harness.naiveCardinality, cardinality.HyperLogLog, sizes);
    console.log('HyperLogLog');
    console.log(results);
    return done();
  });
});