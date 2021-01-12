"use strict";

let ARR08 = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  , ARR19 = [ , 1, 2, 3, 4, 5, 6, 7, 8, 9]
;
class SDKHelper { }
SDKHelper.HOUSE = ['ROW', 'COLUMN', 'BLOCK'];
SDKHelper.HOUSE_IDX = {
    ROW: 0
  , COLUMN: 1
  , BLOCK: 2
};

class Cell {
  constructor(e, r, c, b, i) {
    //https://javascript.info/destructuring-assignment
    [this.dom
      , this.r, this.c, this.b, this.i
      , this.clue, this.v, this.bit_cand] = [e, r, c, b, i, undefined, undefined, 0];
    this.gi = [this.ri, this.ci, this.bi] = [this.c + 1, this.r + 1, this.i % 9 + 1];
  }
  index_in_group(g) {
    return this.gi[SDKHelper.HOUSE_IDX[g]];
  }
  cand_set(v, onoff) {
    this.bit_cand = this.bit_cand.onoff_bit(v, onoff);
  }
  cand_check(v) {
    return this.bit_cand.check_bit(v);
  }
  get cand_ls() {
    return get_bit_idx(this.bit_cand)
  }
  toString() {
    return `${this.r}-${this.c}`;
  }

}
class House {
  constructor(type, i) {
    this.type = type;
    this.i = i;
    this.id = type * 9 + i;
    this.name = `${SDKHelper.HOUSE[type]}-${i}`;
    //array 9 CandHouse
    this.c = ARR19.map(v => new CandHouse(v, this));
  }
  toString() {
    return this.name;
  }  
}
class CandHouse {
  constructor(v, house) {
    [this.v, this.house, this.bit_cell] = [v, house, 0];
  }
  cell_set(v, onoff) { this.bit_cell = this.bit_cell.onoff_bit(v, onoff); }
  cell_check(v) { return this.bit_cell.check_bit(v); }

  get cell_ls() { return get_bit_idx(this.bit_cell) }
  get length() { return this.cell_ls.length; }

  cell_idx(i) { return BOARD.hi[this.house.id][cell_ls[i] - 1]; }

  toString() {
    return `${this.house.name}-${this.nth} of Candidate ${this.v}`;
  }
}

let BOARD = {
    rc: ARR08.map(() => [])
  , cr: ARR08.map(() => [])
  , bi: ARR08.map(() => [])
  , hi: [...ARR08, ...ARR08, ...ARR08].map(_ => [])
  , ix: []
  , affect: {
      rv: ARR08.map(() => [])
    , cv: ARR08.map(() => [])
    , bv: ARR08.map(() => [])
  }
  , house: new function() {
      this.r = ARR08.map(i => new House(0, i));
      this.c = ARR08.map(i => new House(1, i));
      this.b = ARR08.map(i => new House(2, i));
      this.i = [...this.r, ...this.c, ...this.b];
  }
}
