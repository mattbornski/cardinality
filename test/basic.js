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

describe('Hyper Log Log algorithm', function () {
  it('with short words', function (done) {
    var size = 100000;
    harness.compare(harness.heavilyOverlappingShortWords, harness.naiveCardinality, cardinality.set, size, function (error, result) {
      if (error) {
        return done(error);
      }
      console.log('for set of size ~' + size + '...');
      console.log('  HyperLogLog estimated ' + result['counts'][1] + ' items in ' + result['times'][1] + ' ms');
      console.log('  Naive counting netted ' + result['counts'][0] + ' items in ' + result['times'][0] + ' ms');
      var deviation = (Math.abs(result['counts'][0] - result['counts'][1]) / result['counts'][0]);
      console.log(deviation);
      // The allowable deviation for this test is pretty high:
      assert(deviation <= 0.25);
      return done();
    });
  });
});

describe('Hyper Log Log algorithm', function () {
  it('with BSON object id strings', function (done) {
    var size = 100000;
    harness.compare(harness.lightlyOverlappingObjectIds, harness.naiveCardinality, cardinality.set, size, function (error, result) {
      if (error) {
        return done(error);
      }
      console.log('for set of size ~' + size + '...');
      console.log('  HyperLogLog estimated ' + result['counts'][1] + ' items in ' + result['times'][1] + ' ms');
      console.log('  Naive counting netted ' + result['counts'][0] + ' items in ' + result['times'][0] + ' ms');
      var deviation = (Math.abs(result['counts'][0] - result['counts'][1]) / result['counts'][0]);
      console.log(deviation);
      // The allowable deviation for this test is pretty high:
      assert(deviation <= 0.25);
      return done();
    });
  });
});