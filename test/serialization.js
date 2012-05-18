/* Mocha test
   to use:
     npm install mocha
     mocha <filename>
   or
     npm test
*/

var assert = require('assert');
var cardinality = require('../lib/index');

describe('Table persistence', function () {
  it('should properly and consistently serialize and deserialize', function (done) {
    var firstSet = new cardinality.set();
    for (var i = 0; i < 10000; i++) {
      firstSet.add(i.toString() + 'abcdef' + (10000 - i).toString());
    }
    
    var firstEstimatedSize = firstSet.size();
    console.log(firstEstimatedSize);
    
    var firstSerialization = firstSet.serialize();
    console.log(firstSerialization);
    // Ensure the serialization is a string
    assert(firstSerialization.toString() === firstSerialization);
    // Ensure the serialization is a JSON encoded object
    assert(JSON.parse(firstSerialization) instanceof Object);
    
    // Make a new set from the serialization of the old set
    var secondSet = new cardinality.set(firstSerialization);
    // Ensure that the size estimate of the new set is the same as the old set
    var secondEstimatedSize = secondSet.size();
    console.log(secondEstimatedSize);
    assert(firstEstimatedSize === secondEstimatedSize);
    // Ensure that the serialization of the new set is the same as the old set
    var secondSerialization = secondSet.serialize();
    console.log(secondSerialization);
    assert(secondSerialization === firstSerialization);
    return done();
  });
  
  it('should reject malformed serialization', function (done) {
    var firstSet = new cardinality.set();
    for (var i = 0; i < 10000; i++) {
      firstSet.add(i.toString() + 'abcdef' + (10000 - i).toString());
    }
    
    var serialization = firstSet.serialize();
    var obj = JSON.parse(serialization);
    obj['b'] += 1;
    serialization = JSON.stringify(obj);
    
    try {
      var secondSet = new cardinality.set(serialization);
      console.log(secondSet);
      return done(new Error('Somehow we managed to deserialize a malformed serialization'));
    } catch (error) {
      return done();
    }
  });
});