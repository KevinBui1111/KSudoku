"use strict";

let sieve_part = []
  , spd_part = []; // smallest prime divisor

function init_space_enh(size) {
  // console.time('init_space');

  // Array.fill(true); is very slow and consume huge memory
  for (let i = 0; i < size; ++i) sieve_part[i] = true;

  // fastest way initial sequence array
  for (let i = 0; i < size; ++i) spd_part[i] = 0;

  // console.timeEnd('init_space');
}

function sieve_era_part(primes, from, N) {
  // assume primes is the list of prime number from 2 to 'from' param
  for (let i = 0; i < N - from; ++i) sieve_part[i] = true;

  let limit = Math.ceil(Math.sqrt(N));
  if (primes.at(-1) < limit - 2) {
    console.error(`Not enough base primes to find up to ${N}`);
    return;
  }

  for (let i = 0; primes[i] < limit; ++i) {
    let p = primes[i];

    // let cross = [];
    let inc = p > 2 ? 2 : 1;
    let mul = Math.ceil(from / p);
    if (p > 2 && (mul & 1) === 0) ++mul; // odd, not even
    if (mul < p) mul = p;
    for (; mul * p < N; mul += inc) {
      sieve_part[mul * p - from] = false;
      // cross.push(mul * p);
    }
    // console.info(`cross ${p}: ${cross}`);
  }

  let new_primes = [], j = -1;
  for (let i = Math.max(from, 2); i < N; ++i)
    if (sieve_part[i - from])
      new_primes[++j] = i;

  return new_primes;
}

function Sieve22Max(N) {
  // default all prime
  init_space_enh(N);

  let prime = [];

  for (let i = 2; i < N; ++i) {
    if (sieve_part[i]) {
      prime.push(i);
      spd_part[i] = i;
    }

    for (let p of prime) {
      if (p > spd_part[i] || p * i >= N) break;

      sieve_part[p * i] = false;
      spd_part[p * i] = p;
    }
  }

  return prime;
}

// Best record: 5e7 nth prime is 982,451,653, in 5,576.56 ms
function nth_prime(n) {
  let SEG_SIZE = 1e6
    , bound = 1e6
    , primes = Sieve22Max(bound);

  while(primes.length < n) {
    // sieve for next segment
    let new_primes = sieve_era_part(primes, bound, bound + SEG_SIZE);
    bound += SEG_SIZE;

    // extend primes
    primes.push.apply(primes, new_primes);
  }

  return primes[n - 1];
}
