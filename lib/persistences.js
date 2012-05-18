module.exports = {
  'memory': {
    'name': 'memory',
    // Create a new in-memory table.
    // Return an object which encapsulates all in-memory state for this persistence mechanism.
    // This method is intended to be fire-and-forget; no callback given.
    'initialize': function (numBuckets, settings) {
      // select b from the set of positive integers, and set m as 2 to the power of b
      // initialize a collection of m registers to negative infinity (here we use zero
      // for serialization purposes, which is algorithmically indistinguishable)
      var state = {
        'M': [],
        'count': 0,
      };
      for (var i = 0; i < Math.pow(2, numBuckets); i++) {
        if (state['M'][i] === undefined) {
          state['M'][i] = 0;
        }
      }
      return state;
    },
    // Restore an old table's state, which we are certain is from the same
    // type of persistence.
    'restore': function (state, settings) {
      // Not much to be done here, since the in-memory persistence mechanism
      // keeps data in the standard serialization format.
      return {
        'M': state['M'],
        'count': state['count'],
      };
    },
    // Insert another key into the persistence mechanism.
    // The hash algorithm has already been applied.
    // This method is intended to be fire-and-forget; no callback given.
    'insert': function (state, bucketIndex, bucketValue) {
      state['M'][bucketIndex] = Math.max(state['M'][bucketIndex], bucketValue);
      state['count'] += 1;
      return state;
    },
    // Finalize your data storage if necessary, then call callback.
    'flush': function (state, callback) {
      callback();
    },
    // Retrieve our buckets from our state, then pass them to the callback.
    'retrieve': function (state, callback) {
      callback({
        'M': state['M'],
        'count': state['count'],
      });
    },
  },
};