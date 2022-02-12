"use strict";

let sieve_part = []
  , spd_part = []; // smallest prime divisor
let MAX = 1e6;

function init_space_enh(size) {
  console.time('init_space');

  // Array.fill(true); is very slow and consume huge memory
  for (let i = 0; i < size; ++i) sieve_part[i] = true;

  // fastest way initial sequence array
  for (let i = 0; i < size; ++i) spd_part[i] = 0;

  console.timeEnd('init_space');
}

function sieve_era_part(primes, from, N) {
  // assume primes is the list of prime number from 2 to 'from' param
  init_space_enh(N - from + 1);

  let limit = Math.ceil(Math.sqrt(N));
  if (primes.at(-1) < limit) {
    console.error(`Not enough base primes to find up to ${N}`);
    return;
  }

  for (let i = 0; primes[i] <= limit; ++i) {
    let p = primes[i];

    let cross = [];
    let inc = p > 2 ? 2 : 1;
    let mul = Math.ceil(from / p);
    if (p > 2 && (mul & 1) === 0) ++mul; // odd, not even
    if (mul < p) mul = p;
    for (; mul * p <= N; mul += inc) {
      sieve_part[mul * p - from] = false;
      cross.push(mul * p);
    }
    console.info(`cross ${p}: ${cross}`);
  }

  let new_primes = [], j = -1;
  for (let i = Math.max(from, 2); i <= N; ++i)
    if (sieve_part[i - from])
      new_primes[++j] = i;

  return new_primes;
}

function Sieve22Max() {
  // default all prime
  init_space_enh(MAX + 1);

  let prime = [];

  for (let i = 2; i <= MAX; ++i) {
    if (sieve_part[i]) {
      prime.push(i);
      spd_part[i] = i;
    }

    for (let p of prime) {
      if (p > spd_part[i] || p * i > MAX) break;

      sieve_part[p * i] = false;
      spd_part[p * i] = p;
    }
  }

  return prime;
}

function nth_prime(n) {
  init_space_enh(MAX + 1);

  // find prime up to MAX

  let limit = Math.ceil(Math.sqrt(N));
  if (primes.at(-1) < limit) {
    console.error(`Not enough base primes to find up to ${N}`);
    return;
  }

  for (let i = 0; primes[i] <= limit; ++i) {
    let p = primes[i];

    let cross = [];
    let inc = p > 2 ? 2 : 1;
    let mul = Math.ceil(from / p);
    if (p > 2 && (mul & 1) === 0) ++mul; // odd, not even
    if (mul < p) mul = p;
    for (; mul * p <= N; mul += inc) {
      sieve_part[mul * p - from] = false;
      cross.push(mul * p);
    }
    console.info(`cross ${p}: ${cross}`);
  }

  let new_primes = [], j = -1;
  for (let i = Math.max(from, 2); i <= N; ++i)
    if (sieve_part[i - from])
      new_primes[++j] = i;

  return new_primes;
}
