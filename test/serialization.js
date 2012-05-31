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
    var count = 0;
    for (var i = 0; i < 10000; i++) {
      firstSet.add(i.toString() + 'abcdef' + (10000 - i).toString(), function () {
        count++;
        if (count === 10000) {
          firstSet.size(function (error, firstEstimatedSize) {
            console.log(firstEstimatedSize);

            firstSet.serialize(function (error, firstSerialization) {
              console.log(firstSerialization);
              // Ensure the serialization is a string
              assert(firstSerialization.toString() === firstSerialization);
              // Ensure the serialization is a JSON encoded object
              assert(JSON.parse(firstSerialization) instanceof Object);

              // Make a new set from the serialization of the old set
              var secondSet = new cardinality.set(firstSerialization);
              // Ensure that the size estimate of the new set is the same as the old set
              secondSet.size(function (error, secondEstimatedSize) {
                console.log(secondEstimatedSize);
                assert(firstEstimatedSize === secondEstimatedSize);
                // Ensure that the serialization of the new set is the same as the old set
                secondSet.serialize(function (error, secondSerialization) {
                  console.log(secondSerialization);
                  assert(secondSerialization === firstSerialization);
                  return done();
                });
              });
            });
          });
        }
      });
    }
  });
  
  it('should reject malformed serialization', function (done) {
    var firstSet = new cardinality.set();
    for (var i = 0; i < 10000; i++) {
      firstSet.add(i.toString() + 'abcdef' + (10000 - i).toString());
    }
    
    firstSet.serialize(function (error, serialization) {
      if (error) {
        return done(error);
      }

      var obj = JSON.parse(serialization);
      obj['b'] += 1;
      serialization = JSON.stringify(obj);

      new cardinality.set(serialization, function (error, secondSet) {
        if (error) {
          // This is actually expected, this is supposed to be a malformed serialization.
          console.log(error);
          return done();
        }
        console.log(secondSet);
        return done(new Error('Somehow we managed to deserialize a malformed serialization'));
      });
    });
  });
});