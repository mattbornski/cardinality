var hashes = require('./hashes');

var configuration = {
  'hash': 'murmur128',
};
var configure = function (settings) {
  // TODO: Allow changing configuration before set construction
};

var convert = function (set) {
  // TODO: Allow converting a naive set to a HyperLogLog set
};

/**
 * Constructs a new cardinality set or reconstructs one from a serialization.
 * Accepts one of the following:
 *  - an array of values to insert
 *  - an object whose keys should be inserted
 *  - a serialized representation of a set
 *
 * Note that while we quote the hyper log log algorithm extensively in this
 * file, we use zero-indexed arrays so the logic may not look identical.  We
 * also use 0 instead of negative infinity for the purposes of easier JSON
 * serialization.
 */
var set = function () {
  if (!(this instanceof set)) {
    // forces "new"
    return set.apply(new set(), arguments);
  }
  var serialization = {};
  var array = [];
  if (arguments.length === 1 && arguments[0] instanceof Array) {
    array = arguments[0];
  } else if (arguments.length === 1 && arguments[0] instanceof Object) {
    array = Object.keys(arguments[0]);
  } else if (arguments.length === 1 && arguments[0] instanceof String) {
    serialization = JSON.parse(arguments[0]);
  } else if (arguments.length > 0) {
    throw new Error('new set([array|object|serialized set])');
  }
  // TODO: if the set size looks likely to remain small, use naive set until untenable.
  this.hash = hashes[serialization['hash'] || configuration['hash']];
  if (!this.hash) {
    throw new Error('Hash function "' + (serialization['hash'] || configuration['hash']) + '" not found');
  }
  // select b from the set of positive integers, and set m as 2 to the power of b
  // initialize a collection of m registers to negative infinity (here we use zero
  // for serialization purposes, which is algorithmically indistinguishable)
  this.M = serialization['table'] || [];
  for (var j = 0; j < Math.pow(2, this.hash['b']); j++) {
    if (this.M[j] === undefined) {
      this.M[j] = 0;
    }
  }
  
  for (var i = 0; i < array.length; i++) {
    // for value in array do
    this.push(array[i]);
  }
  return this;
};
set.prototype.push = function (v) {
  // set x as hash of v
  var x = this.hash['fn'](v);
  // set j as 1 + the binary address determined by the first b bits of x
  var j = '';
  for (var i = 0; i < this.hash['b']; i++) {
    j += (x[i] ? '1' : '0');
  }
  j = parseInt(j, 2);
  // set w as the the binary value of the rest of the bits of x (omitted)
  // set the register of M with index j to the maximum of the current value of
  // said register or the value of rho(w), where rho(w) is the logical position of the
  // leftmost non-zero bit in w.  Note that although we are using "zero indexed" bits
  // here, the value of rho(w) is used as an actual numerical value, NOT an index,
  // so we add 1 to correspond with the algorithm.
  var rhoW = x.indexOf(true, this.hash['b']);
  if (rhoW === -1) {
    rhoW = x.length - this.hash['b'];
  } else {
    rhoW -= this.hash['b'];
  }
  this.M[j] = Math.max(this.M[j], rhoW + 1);
};
set.prototype.size = function () {
  var Z = 0;
  for (var j = 0; j < this.M.length; j++) {
    Z += 1 / Math.pow(2, this.M[j]);
  }
  var alphas = {
    4: 0.673,
    5: 0.697,
    6: 0.709,
  };
  return parseInt((alphas[this.hash['b']] || (0.7213 / (1 + 1.079 / this.M.length))) * this.M.length * this.M.length / Z);
};
set.prototype.serialize = function () {
  return JSON.stringify({
    'hash': this.hash,
    'table': this.M,
  });
};

module.exports = {
  'configure': configure,
  'set': set,
};