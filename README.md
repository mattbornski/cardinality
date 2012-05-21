# Cardinality estimation using HyperLogLog algorithm [![Build Status](http://travis-ci.org/mattbornski/cardinality.png)](http://travis-ci.org/mattbornski/cardinality)

The HyperLogLog algorithm estimates the cardinality of the data set (i.e. number of distinct elements in the data set) without having to store the actual elements seen, which would be required for a naive unique count implementation.  In order to achieve a high degree of accuracy with a low memory footprint, a good hash algorithm must be chosen.

## Installation
```bash
npm install cardinality
```

## Usage
```javascript

```

## Extending

Recognizing that other people might not use the algorithm in the exact same way I do, I have attempted to preserve the integrity of the core algorithm while allowing end-users to extend many pieces of the implementation; in particular, the hash algorithm and the storage mechanisms are designed to be easily replaced in a modular fashion.

Known extensions:


## Credits

Many tech bloggers and scalability evangelists have been writing about HyperLogLog and related ideas recently; however, this work is principally derived from the following pieces of work:

1. [http://github.com/sedictor/loglog](The GitHub repo of reference PHP and Javascript implementations of the LogLog and HyperLogLog algorithms by Vadim Semenov), from which this repository was originally forked.

2. The paper by Philippe Flajolet, Éric Fusy, Olivier Gandouet and Frédéric Meunier entitled "HyperLogLog: the analysis of a near-optimal cardinality estimation algorithm", available [http://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf](here) as well as [blob/master/HyperLogLog.pdf](here) for your reference.