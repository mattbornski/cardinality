module.exports = {
  'heavilyOverlappingShortWords': function (count) {
    var result = [];

    while (count > 0) {
      var word = '';
      for (var j = 0; j < (parseInt(Math.random() * (8 - 1)) + 1); j++) { // from 1char to 8chars
        word += String.fromCharCode(parseInt(Math.random() * (122 - 97)) + 97); // a-z
      }

      for (var i = 0; i < Math.random() * 100; i++) {
        result.push(word);
        count--;
      }
    }
    return result;
  },
  'lightlyOverlappingObjectIds': function (count) {
    var result = [];

    while (count > 0) {
      var word = '';
      for (var j = 0; j < 24; j++) {
        word += '0123456789abcdef'[Math.floor(Math.random() * 16)];
      }

      for (var i = 0; i < Math.random() * 2; i++) {
        result.push(word);
        count--;
      }
    }
    return result;
  },
  'naiveCardinality': function (arr) {
    var t = {}, r = 0;
    for (var i = 0, l = arr.length; i < l; i++) {
      if (!t.hasOwnProperty(arr[i])) {
        t[arr[i]] = 1;
        r++;
      }
    }
    return {'size': function (callback) { callback (null, r); }};
  },
  'compare': function (inputs, f1, f2, size, callback) {
    var data = inputs(size);
      
    var f1Start = Date.now();
    f1(data).size(function (error, f1Count) {
      if (error) {
        throw error;
      }
      var f1End = Date.now();

      var f2Start = Date.now();
      f2(data).size(function (error, f2Count) {
        if (error) {
          throw error;
        }
        var f2End = Date.now();
        callback(null, {
          'counts': [f1Count, f2Count],
          'times': [(f1End - f1Start), (f2End - f2Start)],
        });
      });
    });
  },
};