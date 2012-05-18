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
    var sizes = [
      100000,
    ];
    var results = harness.compare(harness.heavilyOverlappingShortWords, harness.naiveCardinality, cardinality.set, sizes);
    for (var index in sizes) {
      console.log('for set of size ~' + sizes[index] + '...');
      console.log('  HyperLogLog estimated ' + results[index]['counts'][1] + ' items in ' + results[index]['times'][1] + ' ms');
      console.log('  Naive counting netted ' + results[index]['counts'][0] + ' items in ' + results[index]['times'][0] + ' ms');
      var deviation = (Math.abs(results[index]['counts'][0] - results[index]['counts'][1]) / results[index]['counts'][0]);
      console.log(deviation);
      // The allowable deviation for this test is pretty high:
      assert(deviation <= 0.25);
    }
    return done();
  });
});

describe('Hyper Log Log algorithm', function () {
  it('with BSON object id strings', function (done) {
    var sizes = [
      100000,
    ];
    var results = harness.compare(harness.lightlyOverlappingObjectIds, harness.naiveCardinality, cardinality.set, sizes);
    for (var index in sizes) {
      console.log('for set of size ~' + sizes[index] + '...');
      console.log('  HyperLogLog estimated ' + results[index]['counts'][1] + ' items in ' + results[index]['times'][1] + ' ms');
      console.log('  Naive counting netted ' + results[index]['counts'][0] + ' items in ' + results[index]['times'][0] + ' ms');
      var deviation = (Math.abs(results[index]['counts'][0] - results[index]['counts'][1]) / results[index]['counts'][0]);
      console.log(deviation);
      // The allowable deviation for this test is pretty high:
      assert(deviation <= 0.25);
    }
    return done();
  });
});