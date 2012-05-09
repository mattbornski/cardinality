module.exports.LogLog = function (arr) {
    var HASH_LENGTH = 32, // bites
        HASH_K = 5; // HASH_LENGTH = 2 ^ HASH_K

    /**
     * Jenkins hash function
     *
     * @url http://en.wikipedia.org/wiki/Jenkins_hash_function
     *
     * @param {String} str
     * @return {Number} Hash
     */
    function hash(str) {
        var hash = 0;

        for (var i = 0, l = str.length; i < l; i++) {
            hash += str.charCodeAt(i);
            hash += hash << 10;
            hash ^= hash >> 6;
        }

        hash += hash << 3;
        hash ^= hash >> 6;
        hash += hash << 16;

        return hash;
    }

    /**
     * Offset of first 1-bit
     *
     * @example 00010 => 4
     *
     * @param {Number} bites
     * @return {Number}
     */
    function scan1(bites) {
        if (bites == 0) {
            return HASH_LENGTH - HASH_K;
        }
        var offset = parseInt(Math.log(bites) / Math.log(2));
        offset = HASH_LENGTH - HASH_K - offset;
        return offset;
    }

    /**
     * @param {String} $bites
     * @param {Number} $start >=1
     * @param {Number} $end   <= HASH_LENGTH
     *
     * @return {Number} slice of $bites
     */
    function getBites(bites, start, end) {
        var r = bites >> (HASH_LENGTH - end);
        r = r & (Math.pow(2, end - start + 1) - 1);

        return r;
    }

    var M = [];
    for (var i = 0, l = arr.length; i < l; i++) {
        var h = hash(arr[i]),
            j = getBites(h, 1, HASH_K) + 1,
            k = getBites(h, HASH_K + 1, HASH_LENGTH);
        k = scan1(k);

        if (typeof M[j] == 'undefined' || M[j] < k) {
            M[j] = k;
        }
    }

    var alpha = 0.77308249784697296; // (Gamma(-1/32) * (2^(-1/32) - 1) / ln2)^(-32)

    var E = 0;
    for (var i = 1; i <= HASH_LENGTH; i++) {
        if (typeof M[i] != 'undefined') {
            E += M[i];
        }
    }
    E /= HASH_LENGTH;
    E = alpha * HASH_LENGTH * Math.pow(2, E);

    return parseInt(E);
};