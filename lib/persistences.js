module.exports = {
  'memory': {
    // Key attributes
    'name': 'memory',



    // Functions
    //
    // Create a new in-memory table.
    // Return an object which encapsulates all in-memory state for this persistence mechanism.
    'create': function (numBuckets, settings, callback) {
      // select b from the set of positive integers, and set m as 2 to the power of b
      // initialize a collection of m registers to negative infinity (here we use zero
      // for serialization purposes, which is algorithmically indistinguishable)
      var state = {
        'M': [],
        'count': 0,
      };
      for (var i = 0; i < numBuckets; i++) {
        if (state['M'][i] === undefined) {
          state['M'][i] = 0;
        }
      }

      // Return the new state.
      callback(null, state);
    },

    // Restore from a previous state.
    'restore': function (state, settings, callback) {
      // Not much to be done here, since the in-memory persistence mechanism
      // keeps data in the standard serialization format.

      // Return nothing
      callback(null, null);
    },

    // Insert another key into the persistence mechanism.
    // The hash algorithm has already been applied.
    'insert': function (state, bucketIndex, bucketValue, callback) {
      state['M'][bucketIndex] = Math.max(state['M'][bucketIndex], bucketValue);
      state['count'] += 1;

      // Return nothing
      callback(null, null);
    },

    // Retrieve a representation of the buckets from our state, then pass them to the callback.
    'represent': function (state, callback) {

      // Return the *representation* which is different than the state.
      callback(null, {
        'M': state['M'],
        'count': state['count'],
      });
    },
  },
};