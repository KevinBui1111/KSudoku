"use strict";

let sieve = [], slf = [];
let MAX = 90e6;

function init_space(MAX) {
  console.time('init_space');

  // Array.fill(true); is very slow and consume huge memory
  for (let i = 0; i < MAX + 1; ++i) sieve[i] = true;

  // fastest way initial sequence array
  for (let i = 0; i < MAX + 1; ++i) slf[i] = i;

  console.timeEnd('init_space');
}

function SieveEratosthenes(n) {
  init_space(MAX);
  let prime = [];

  for (let i = 2; i <= MAX && prime.length < n; ++i) {
    if (sieve[i]) {
      prime.push(i);
      slf[i] = i;

      // let cross = [];
      for (let mul = i; mul * i <= MAX; ++mul) {
        if (slf[mul] >= i) {
          sieve[mul * i] = false;
          slf[mul * i] = i;

          // cross.push(mul * i);
        }
      }
      // console.info(`cross ${i}: ${cross}`);
    }
  }
  if (prime.length < n)
    console.error('Need to increase MAX bound');

  return prime.at(-1);
}

// it's not good as SieveEratosthenes
function SieveEratosthenes_2(n) {
  init_space(MAX);
  let prime = [];

  for (let i = 2; i <= MAX && prime.length < n; ++i) {
    if (sieve[i]) {
      prime.push(i);
      slf[i] = i;
    }
    // let cross = [];
    for (let p of prime) {
      if (p > slf[i] || p * i > MAX) break;

      sieve[p * i] = false;
      slf[p * i] = p;

      // cross.push(p * i);
    }
    // console.info(`cross ${i}: ${cross}`);
  }
  if (prime.length < n)
    console.error('Need to increase MAX bound');

  return prime.at(-1);
}