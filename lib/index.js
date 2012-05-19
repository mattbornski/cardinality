var Future = require('fibers/future');
var hashes = require('./hashes');
var persistences = require('./persistences');

// Helper functions to recognize data structures
var isHashMechanism = function (algo) {
  if (algo instanceof Object) {
    // You must name your hash mechanisms
    if (algo['name'] && algo['name'].toString() === algo['name'] && algo['name'].length > 0) {
      // Your hash mechanism must include a function which takes a string and returns an array of truth values.
      if (algo['fn'] instanceof Function && algo['fn'].length === 1) {
        // Your hash mechanism must specify how many bits are used to bucketize hashed values.
        if (typeof(algo['b']) === 'number' && (algo['b'] % 1 === 0) && algo['b'] >= 0) {
          return true;
        }
      }
    }
  }
  return false;
};

var isPersistenceMechanism = function (algo) {
  if (algo instanceof Object) {
    // You must name your persistence mechanisms
    if (algo['name'] && algo['name'].toString() === algo['name'] && algo['name'].length > 0) {
      // We need to be able to initialize new instances
      if (algo['initialize'] instanceof Function) {
        // And restore old ones
        if (algo['restore'] instanceof Function) {
          // And add values
          if (algo['insert'] instanceof Function) {
            // And flush any pending insertions
            if (algo['flush'] instanceof Function) {
              // And retrieve the buckets so we can calculate size
              if (algo['retrieve'] instanceof Function) {
                return true;
              }
            }
          }
        }
      }
    }
  }
  return false;
};

var isState = function (obj) {
  if (obj instanceof Object) {
    // You must have specified your persistence mechanism
    if (obj['persistence'] && obj['persistence'].toString() === obj['persistence'] && obj['persistence'].length > 0) {
      // You must have specified your hash mechanism and 'b' parameter.
      if (obj['hash'] && obj['hash'].toString() === obj['hash'] && obj['hash'].length > 0) {
        if (typeof(obj['b']) === 'number' && (obj['b'] % 1 === 0) && obj['b'] >= 0) {
          // You must have specified your buckets and your insertion count, and
          // your bucket count must match the expected 2^b length
          if (obj['M'] instanceof Array && obj['M'].length === Math.pow(2, obj['b'])) {
            return true;
          }
        }
      }
    }
  }
  return false;
};



// Allow registering third-party mechanisms for use by callers
var register = function (what) {
  if (isHashMechanism(what)) {
    hashes[what['name']] = what;
  } else if (isPersistenceMechanism(what)) {
    persistences[what['name']] = what;
  } else {
    throw new Error('Unrecognized mechanism: ' + what);
  }
};


// Configuration for core implementation
// We start with some sane defaults
var configuration = {
  'hash': hashes['murmur128'],
  'persistence': persistences['memory'],
};

// Exported function to allow developer or extension modules to reconfigure
var configure = function (options, storage) {
  if (storage === undefined) {
    storage = configuration;
  }
  for (var key in options) {
    if (key === 'hash') {
      // Allow selecting built in hash implementations by name, or providing your own interface.
      var hash = hashes[options[key]] || options[key];
      // Sanity check that this is a hash function of the format we expect.
      if (isHashMechanism(hash)) {
        storage[key] = hash;
      } else {
        throw new Error(options[key] + ' does not define or identify a usable hash mechanism');
      }
    } else if (key === 'persistence') {
      // Allow selecting built in persistence implementations by name, or providing your own interface.
      var persistence = persistences[options[key]] || options[key];
      // Sanity check that this is a persistence function of the format we expect.
      if (isPersistenceMechanism(persistence)) {
        storage[key] = persistence;
      } else {
        throw new Error(options[key] + ' does not define or identify a usable persistence mechanism');
      }
    } else {
      storage[key] = options[key];
    }
  }
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

  var settings = {};
  var state = null;
  var seedData = [];

  var args = Array.prototype.slice.call(arguments);
  for (var i in args) {
    if (isHashMechanism(args[i])) {
      settings['hash'] = args[i];
    } else if (isPersistenceMechanism(args[i])) {
      settings['persistence'] = args[i];
    } else if (isHashMechanism(hashes[args[i]])) {
      settings['hash'] = hashes[args[i]];
    } else if (isPersistenceMechanism(persistences[args[i]])) {
      settings['persistence'] = persistences[args[i]];
    } else if (args[i].toString() === args[i]) {
      // Load from serialized state
      try {
        var deserialization = JSON.parse(args[i]);
        if (isState(deserialization)) {
          state = deserialization;
        } else {
          // quick throw into the wrapping catch
          throw new Error();
        }
      } catch (error) {
        throw new Error('Unable to parse serialization from argument: ' + args[i]);
      }
    } else if (args[i] instanceof Array) {
      // Initial data
      // TODO inspect to make sure only strings?
      seedData = seedData.concat(args[i]);
    } else if (args[i] instanceof set) {
      // Copy construction?
      // TODO
    } else if (args[i] instanceof Object) {
      if (isState(args[i])) {
        // Load from captured state
        state = args[i];
      } else {
        // Configuration parameters?
        configure(args[i], settings);
      }
    } else {
      // ?
      throw new Error('Unable to use argument: ' + args[i]);
    }
  }

  this.settings = {};
  // Restore data, if appropriate
  if (state) {
    // Use the parameters from restored state before anything passed in
    this.settings['hash'] = hashes[state['hash']];
    this.settings['persistence'] = persistences[state['persistence']];
    this.settings['b'] = state['b'];

    // Restore
    this.state = this.settings['persistence'].restore(state, settings);
  } else {
    this.settings = settings;
    // Set up all parameters before initializing
    this.settings['hash'] = this.settings['hash'] || configuration['hash'];
    this.settings['b'] = this.settings['b'] || configuration['b'] || this.settings['hash']['b'];
    this.settings['persistence'] = settings['persistence'] || configuration['persistence'];

    // Initialize anew, if nothing to restore
    this.state = this.settings['persistence'].initialize(this.settings['b'], settings);
  }

  // Inject new data, if appropriate
  if (seedData) {
    for (var i = 0; i < seedData.length; i++) {
      this.add(seedData[i]);
    }
  }

  return this;
};

// This function performs the hash calculations according to the HyperLogLog
// algorithm.  Not exported to prevent people from shooting themselves in the
// foot.
var calculate = function (value, fn, b) {
  // set x as hash of v
  var x = fn(value);
  // set j as 1 + the binary address determined by the first b bits of x
  var j = '';
  for (var i = 0; i < b; i++) {
    j += (x[i] ? '1' : '0');
  }
  j = parseInt(j, 2);
  // set w as the the binary value of the rest of the bits of x (omitted)
  // set the register of M with index j to the maximum of the current value of
  // said register or the value of rho(w), where rho(w) is the logical position
  // of the leftmost non-zero bit in w.  Note that although we are using "zero
  // indexed" bits here, the value of rho(w) is used as an actual numerical
  // value, NOT an index, so we add 1 to correspond with the algorithm.
  var rhoW = x.indexOf(true, b);
  if (rhoW === -1) {
    rhoW = x.length - b;
  } else {
    rhoW -= b;
  }
  return {'bucketIndex': j, 'bucketValue': rhoW + 1};
};

// Core function: adding items
set.prototype.add = function (v, callback) {
  // TODO inspect to make sure only strings?
  var calculation = calculate(v, this.settings['hash']['fn'], this.settings['b']);
  this.settings['persistence']['insert'](this.state, calculation['bucketIndex'], calculation['bucketValue']);

  // If you pass a callback, we'll assume you want the data to be flushed
  // before we return.
  if (callback) {
    this.settings['persistence']['flush'](this.state, callback);
  }
  // Otherwise this will happen at the convenience of the persistence mechanism.
};
// Core function: Merging sets
set.prototype.union = function (other, callback) {
  // TODO

  // If you pass a callback, we'll assume you want the data to be flushed
  // before we return.
  if (callback) {
    this.settings['persistence']['flush'](this.state, callback);
  }
  // Otherwise this will happen at the convenience of the persistence mechanism.
};
// Core function: estimating size
set.prototype.size = function (callback) {
  var obj = this;
  var future = new Future();
  obj.settings['persistence']['flush'](obj.state, function () {
    obj.settings['persistence']['retrieve'](obj.state, function (state) {
      var Z = 0;
      for (var j = 0; j < state['M'].length; j++) {
        Z += 1 / Math.pow(2, state['M'][j]);
      }
      var alphas = {
        4: 0.673,
        5: 0.697,
        6: 0.709,
      };
      var alpha = alphas[obj.settings['b']] || (0.7213 / (1 + 1.079 / state['M'].length));
      var estimate = parseInt(alpha * state['M'].length * state['M'].length / Z);
      // Sanity check: you can't have more items than you've ever inserted.
      var ret = Math.min(estimate, state['count']);
      future.return(ret);
      if (callback) {
        callback(ret);
      }
    });
  });
  // Make async persistence methods appear sync
  return future.wait();
};
set.prototype.serialize = function (callback) {
  var obj = this;
  var future = new Future();
  obj.settings['persistence']['flush'](obj.state, function () {
    obj.settings['persistence']['retrieve'](obj.state, function (state) {
      var ret = JSON.stringify({
        'hash': obj.settings['hash']['name'],
        'persistence': obj.settings['persistence']['name'],
        'b': obj.settings['b'],
        'M': state['M'],
        'count': state['count'],
      });
      future.return(ret);
      if (callback) {
        callback(ret);
      }
    });
  });
  // Make async persistence methods appear sync
  return future.wait();
};

module.exports = {
  'register': register,
  'configure': configure,
  'set': set,
};