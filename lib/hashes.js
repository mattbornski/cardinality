var BitArray = require('bit-array');
var murmurhash3 = require('murmurhash3');

/**
 * Hash algorithms
 *
 * If you want to make your own hash algorithm, you can do that:
 *
 *   var hashAlgorithm = {};
 *   hashAlgorithm['name'] = 'myCustomHash';
 *   // This is a very bad hash function:
 *   hashAlgorithm['fn'] = function (str) {
 *     return str[0] + str.length.toString()[str.length.toString().length - 1];
 *   };
 *   // You must provide a default "b" parameter for your hash algorithm.
 *   // Generally speaking, a sane "b" parameter might be
 *   // log base 2 (length of your hash output in bits)
 *   hashAlgorithm['b'] = 4;
 *
 *   var cardinality = require('cardinality');
 *   // You can configure each set as you create it:
 *   var s1 = new cardinality.set({'hash': hashAlgorithm});
 *   // Or you can configure the library for all sets you will be creating:
 *   cardinality.configure({'hash': hashAlgorithm});
 *   var s2 = new cardinality.set();
 *
 * You can also tweak the precision of an existing hash algorithm using the
 * "b" parameter.  I advise you to read the literature on HyperLogLog, but
 * generally speaking, a higher "b" value will increase the accuracy of your
 * resulting estimates.  If you want to use a different "b" value with a
 * hash algorithm, you can do that too:
 *
 *   var cardinality = require('cardinality');
 *   var s1 = new cardinality.set({'b': 5});
 *   cardinality.configure({'b': 5});
 *   var s2 = new cardinality.set();
 */

//
//
module.exports = {
  'jenkins32': {
    'name': 'jenkins32',
    'fn': function (str) {
      var hash = 0;

      for (var i = 0; i < str.length; i++) {
        hash += str.charCodeAt(i);
        hash += hash << 10;
        hash ^= hash >> 6;
      }

      hash += hash << 3;
      hash ^= hash >> 6;
      hash += hash << 16;

      return (new BitArray([hash])).toArray().reverse();
    },
    'b': 5,
  },
  'murmur128': {
    'name': 'murmur128',
    'fn': function (str) {
      return (new BitArray(murmurhash3.murmur128Sync(str))).toArray().reverse();
    },
    'b': 7,
  },
};