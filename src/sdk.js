"use strict";

class SDKHelper { }
SDKHelper.HOUSE = ['ROW', 'COLUMN', 'BLOCK'];

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
    this.r = ARR09.map(nth => new CandHouse(v, nth, 0));
    this.c = ARR09.map(nth => new CandHouse(v, nth, 1));
    this.b = ARR09.map(nth => new CandHouse(v, nth, 2));
    this.h = []; //house by ith
    this.h.push.apply(this.h, this.r);
    this.h.push.apply(this.h, this.c);
    this.h.push.apply(this.h, this.b);
  }

  toString() {
    return `Candidate ${this.v}`;
  }
}
class CandHouse {
  constructor(v, nth, house) {
    [this.v, this.nth, this.house, this.ith] = [v, nth, house, house * 9 + nth];
    this.cells = []; // array of Cell
  }
  get length() { return this.cells.length; }
  get house_name() { return `${SDKHelper.HOUSE[this.house]}`; }

  toString() {
    return `${SDKHelper.HOUSE[this.house]} ${this.nth} of Candidate ${this.v}`;
  }
}