var generateWords = function (count) {
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
};

module.exports = {
  'naiveCardinality': function (arr) {
    var t = {}, r = 0;
    for (var i = 0, l = arr.length; i < l; i++) {
      if (!t.hasOwnProperty(arr[i])) {
        t[arr[i]] = 1;
        r++;
      }
    }
    return r;
  },
  'compare': function (f1, f2, sizes) {
    var results = [];
    for (var index in sizes) {
      var words = generateWords(sizes[index]);
      
      var f1Start = Date.now();
      var f1Count = f1(words);
      var f1End = Date.now();
      
      var f2Start = Date.now();
      var f2Count = f2(words);
      var f2End = Date.now();
      results.push({
        'counts': [f1Count, f2Count],
        'times': [(f1End - f1Start), (f2End - f2Start)],
      });
    }
    return results;
  },
};