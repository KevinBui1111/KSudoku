"use strict";

function FindPrimeNumber(n) {
  let prime_list = [2]
    , number = 1
  ;

  while (prime_list.length < n) {
    number += 2;
    let success = 1 // to check if found prime
      , sqrt = ~~Math.sqrt(number)
    ;

    for (let b of prime_list) {
      if (b > sqrt)
        break;
      else if (number % b === 0) {
        success = 0;
        break;
      }
    }

    if (success) prime_list.push(number);
  }

  return prime_list.at(-1);
}