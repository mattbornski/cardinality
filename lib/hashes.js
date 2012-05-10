var BitArray = require('bit-array');
var murmurhash3 = require('murmurhash3');

module.exports = {
  'jenkins32': {
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
    'fn': function (str) {
      return (new BitArray(murmurhash3.murmur128Sync(str))).toArray().reverse();
    },
    'b': 7,
  },
};