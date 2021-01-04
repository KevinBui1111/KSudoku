"use strict";

let ARR08 = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  , ARR19 = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  /*
    i: index
    type: row/col/block
    id: 0-26 (9 + 9 + 9)
  */
  , cand = []
  /*
  cand[1..9] {
    v: number 1..9
    r[0..8]: array of board[][], candidate x is present in cells of row y
    c[0..8]: array of board[][], --~~--
    b[0..8]: array of board[][], --~~--
    cell: array of board[][]
  }
  */
  , board = []
  /* board[r][c] {
    dom: Dom element '.sdk-cell'
    r,c,b,v
    i: number index 0..80
    clue: true/false
    cand[1..9]: true/false
    cand_ls: array of object cand[x]
  }
  */
  , seqcell = []
  , affect = {}
  ;


function import_puzzle(puzzle) {
  affect.rs = ARR08.map(() => [])
  affect.cs = ARR08.map(() => [])
  affect.bs = ARR08.map(() => []);

  for (let i = 0; i < 81; ++i) {
    let r = ~~(i / 9)
      , c = i % 9
      , cell = board[r][c]
      , b = cell.b
      ;
    cell.v = parseInt(puzzle[i]) | 0;
    cell.clue = cell.v > 0;
    //update influence
    affect.rs[r][cell.v] = affect.cs[c][cell.v] = affect.bs[b][cell.v] = true;
  }

  fill_candidate();
}
function fill_candidate() {
  reset_candidate();

  // go through and set candidate for each cell.
  for (let r = 0; r < 9; ++r)
    for (let c = 0; c < 9; ++c)
      if (!board[r][c].v) {
        let cell = board[r][c];
        cell.cand_ls = [];
        for (let v = 1; v <= 9; ++v) {
          cell.cand[v] = !affect.rs[r][v] && !affect.cs[c][v] && !affect.bs[cell.b][v];

          if (cell.cand[v]) {
            cell.cand_ls.push(cand[v]);
            cand[v].r[r].cells.push(cell);
            cand[v].c[c].cells.push(cell);
            cand[v].b[cell.b].cells.push(cell);
          }
        }
      }
}
function reset_candidate() {
  cand = [,...ARR19.map(i => new Candidate(i))]; // add empty at head
}
function check_stat() {
  let rs = ARR08.map(() => []) // ommit 0, count 1..9
    , cs = ARR08.map(() => [])
    , bs = ARR08.map(() => [])
    , conflict = [];
  ;

  for (let r = 0; r < 9; ++r)
    for (let c = 0; c < 9; ++c) {
      let cell = board[r][c]
        , v = cell.v
        , b = cell.b;
      if (cell.v) {
        if (rs[r][v] || cs[c][v] || bs[b][v])
          // conflict
          conflict.push(cell);//.dom.classList.add('conflict');
        else
          rs[r][v] = cs[c][v] = bs[b][v] = true;
      }
    }
  return conflict;
}
function set_value_cell_update_v5(cell, v) {
  // update this cell
  cell.v = v;
  cell.cand.forEach((_, i, b) => b[i] = false); //reset to false
  cell.cand_ls.forEach(c => {
    if (c.v != v) remove_candidate_from_cell(cell, c.v);
  });
  cell.cand_ls = [];
  // update affect
  affect.rs[cell.r][v] = affect.cs[cell.c][v] = affect.bs[cell.b][v] = true;

  // find cell has candidate v, affect by cell
  let affect_set = new Set();
  cand[v].r[cell.r].cells.forEach(c => affect_set.add(c));
  cand[v].c[cell.c].cells.forEach(c => affect_set.add(c));
  cand[v].b[cell.b].cells.forEach(c => affect_set.add(c));

  // empty candidate v from row, colum & block of cell
  cand[v].r[cell.r].cells = [];
  cand[v].c[cell.c].cells = [];
  cand[v].b[cell.b].cells = [];

  // remove candidate from cell in affect_set
  affect_set.forEach(c =>
    remove_candidate_from_cell(c, v
      , c.r !== cell.r
      , c.c !== cell.c
      , c.b !== cell.b)
  );

  return affect_set;
}
function remove_value_cell_update(cell) {
  if (cell.v) { console.log('BAD remove_value_cell_update'); return; }
  // update this cell
  let v = cell.v;
  cell.v = 0;
  // cell.cand[v] = true;
  // update affect
  affect.rs[cell.r][v] = affect.cs[cell.c][v] = affect.bs[cell.b][v] = false;

  // find cell has candidate v, affect by cell
  let affect_set = new Set();
  board[cell.r].forEach(c => { if (!c.v) affect_set.add(c); });
  board[cell.c].forEach(c => { if (!c.v) affect_set.add(c); });
  board[cell.b].forEach(c => { if (!c.v) affect_set.add(c); });

  // remove candidate from cell in affect_set
  return affect_set.filter(c => add_candidate_into_cell(c, v));
}
function remove_candidate_from_cell(cell, v, ir = true, ic = true, ib = true) {
  cell.cand[v] = false;
  cell.cand_ls.remove(cand[v]);
  //remove from CandHouse
  if (ir) cand[v].r[cell.r].cells.remove(cell);
  if (ic) cand[v].c[cell.c].cells.remove(cell);
  if (ib) cand[v].b[cell.b].cells.remove(cell);
}
function add_candidate_into_cell(cell, v) {
  cell.cand[v] = !affect.rs[cell.r][v] && !affect.cs[cell.c][v] && !affect.bs[cell.b][v];

  if (cell.cand[v]) {
    cell.cand_ls.push(cand[v]);
    cand[v].r[r].cells.push(cell);
    cand[v].c[c].cells.push(cell);
    cand[v].b[cell.b].cells.push(cell);
  }
  return cell.cand[v];
}
function check_complete() {
  for (var r = 0; r < 9; ++r)
    for (var c = 0; c < 9; ++c)
      if (!board[r][c].v) return false;
  return true;
}