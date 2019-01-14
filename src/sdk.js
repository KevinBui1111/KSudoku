"use strict";

class Cell {
  constructor(e, r, c, b, i) {
    //https://javascript.info/destructuring-assignment
    [this.dom
      , this.r, this.c, this.b, this.i, this.v
      , this.cand, this.cand_ls] = [e, r, c, b, i, undefined, [], []];
  }

  toString() {
    return `${this.r}-${this.c}`;
  }

}

class Candidate {
  constructor(v) {
    this.v = v;
    this.r = ARR09.map(_ => []);
    this.c = ARR09.map(_ => []);
    this.b = ARR09.map(_ => []);
    this.g = [];
  }

  toString() {
    return `${this.r}-${this.c}`;
  }

}