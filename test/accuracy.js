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

describe('Increasing "b" parameter', function () {
  it('should increase accuracy of estimate using murmur128', function (done) {
    var data = harness.lightlyOverlappingObjectIds(100000);
    var realSize = harness.naiveCardinality(data).size();
    var bb = [7, 8, 9, 10, 11, 12, 13, 14];
    var sizes = [];
    for (var i in bb) {
      var set = cardinality.set(data, {'hash': 'murmur128', 'b': bb[i]});
      sizes.push(set.size());
    }
    console.log('for set of size = ' + realSize + '...');
    var deviations = [];
    for (var index in sizes) {
      console.log('  with b = ' + bb[index] + '...');
      console.log('    HyperLogLog estimated ' + sizes[index] + ' items');
      var deviation = (Math.abs(realSize - sizes[index]) / sizes[index]);
      console.log(deviation);
      // The allowable deviation for this test is pretty high:
      assert(deviation <= 0.25);
      if (deviations.length > 0) {
        // Should not be too much worse than the last one
        assert(deviations < deviations[0] + 0.05);
      }
      if (deviations.length > 2) {
        // Should demonstrate consistent improvement
      }
      deviations.push(deviation);
    }
    return done();
  });
});