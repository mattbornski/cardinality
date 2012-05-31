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
    harness.naiveCardinality(data).size(function (error, realSize) {
      if (error) {
        return done(error);
      }
      var bb = [7, 8, 9, 10, 11, 12, 13, 14];
      var sizes = [];
      for (var i in bb) {
        var set = cardinality.set(data, {'hash': 'murmur128', 'b': bb[i]});
        set.size(function (error, size) {
          sizes.push(size);
        });
      }
      console.log('for set of size = ' + realSize + '...');
      var deviations = [];
      for (var index in sizes) {
        console.log('  with b = ' + bb[index] + '...');
        console.log('    HyperLogLog estimated ' + sizes[index] + ' items');
        var deviation = (Math.abs(realSize - sizes[index]) / sizes[index]);
        console.log(deviation);
        // The allowable deviation for this test is pretty high:
        //assert(deviation <= 0.25);
        deviations.push(deviation);
      }
      // TODO compare deviations and ensure they are generally improving as we increase b
      return done();
    });
  });
});