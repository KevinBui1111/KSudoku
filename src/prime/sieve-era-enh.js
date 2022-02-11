"use strict";

let sieve_part = []
  , spd_part = []; // smallest prime divisor
// let MAX = 90e6;

function init_space_enh(size) {
  console.time('init_space');

  // Array.fill(true); is very slow and consume huge memory
  for (let i = 0; i < size; ++i) sieve_part[i] = true;

  // fastest way initial sequence array
  for (let i = 0; i < size; ++i) spd_part[i] = i;

  console.timeEnd('init_space');
}

function sieve_era_part(primes, from, N) {
  // assume primes is the list of prime number from 2 to 'from' param
  init_space_enh(N - from + 1);

  let limit = ~~Math.sqrt(N) + 1;
  if (primes.at(-1) * primes.at(-1) < N) {
    console.error(`Not enough base primes to find up to ${N}`);
    return;
  }

  for (let i = 0; primes[i] < limit; ++i) {
    let p = primes[i];

    let cross = [];
    let mul = from % p ? from - from % p + p : from;
    for (; mul <= N; mul += p) {
      sieve_part[mul - from] = false;
      cross.push(mul);
    }
    console.info(`cross ${i}: ${cross}`);
  }

  let new_primes = [], j = -1;
  for (let i = from; i <= N; ++i)
    if (sieve_part[i - from])
      new_primes[++j] = i;

  return new_primes;
}
