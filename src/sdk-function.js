"use strict";

let initial_board = _ => {
  BOARD.affect.rv.forEach(s => ARR19.forEach(v => s[v] = false));
  BOARD.affect.cv.forEach(s => ARR19.forEach(v => s[v] = false));
  BOARD.affect.bv.forEach(s => ARR19.forEach(v => s[v] = false));

  BOARD.house.i.forEach(h => h.c.forEach(hc => hc.bit_cell = 0));
}
function import_puzzle(puzzle) {
  initial_board();
  for (let i = 0; i < 81; ++i) {
    let r = ~~(i / 9)
      , c = i % 9
      , cell = BOARD.rc[r][c]
      , b = cell.b
      ;
    cell.v = parseInt(puzzle[i]) | 0;
    cell.bit_cand = 0;
    cell.clue = cell.v > 0;
    //update influence
    BOARD.affect.rv[r][cell.v] = BOARD.affect.cv[c][cell.v] = BOARD.affect.bv[b][cell.v] = true;
  }

  fill_candidate();
}
function fill_candidate() {
  // go through and set candidate for each cell.
  for (let r = 0; r < 9; ++r)
    for (let c = 0; c < 9; ++c)
      if (!BOARD.rc[r][c].v) {
        add_all_candidate_into_cell(BOARD.rc[r][c]);
      }
}
function check_stat() {
  let rs = ARR08.map(() => []) // ommit 0, count 1..9
    , cs = ARR08.map(() => [])
    , bs = ARR08.map(() => [])
    , conflict = [];
  ;

  for (let r = 0; r < 9; ++r)
    for (let c = 0; c < 9; ++c) {
      let cell = BOARD.rc[r][c]
        , v = cell.v
        , b = cell.b;
      if (cell.v) {
        if (rs[r][v] || cs[c][v] || bs[b][v])
          // conflict
          conflict.push(cell);
        else
          rs[r][v] = cs[c][v] = bs[b][v] = true;
      }
    }
  return conflict;
}
function set_value_cell_update_v5(cell, v) {
  if (check_affect(cell, v)) {
    console.log('CONFLICT set_value_cell_update_v5');
    return new Set();
  }
  // check already has value
  let rem_affect = cell.v ? remove_value_cell_update(cell) : [];
  // update this cell
  cell.v = v;
  cell.cand_ls.forEach(c => { if (c != v) remove_candidate_from_cell(cell, c); });
  // update affect
  BOARD.affect.rv[cell.r][v] = BOARD.affect.cv[cell.c][v] = BOARD.affect.bv[cell.b][v] = true;

  // find cell has candidate v, affect by cell
  let affect_set = new Set();
  BOARD.house.r[cell.r].c[v].cell_ls.add_to_set(affect_set);
  BOARD.house.c[cell.c].c[v].cell_ls.add_to_set(affect_set);
  BOARD.house.b[cell.b].c[v].cell_ls.add_to_set(affect_set);

  // empty candidate v from row, colum & block of cell
  BOARD.house.r[cell.r].c[v].bit_cell =
  BOARD.house.c[cell.c].c[v].bit_cell =
  BOARD.house.b[cell.b].c[v].bit_cell = 0;

  // remove candidate from cell in affect_set
  affect_set.forEach(c =>
    remove_candidate_from_cell(c, v
      , c.r !== cell.r
      , c.c !== cell.c
      , c.b !== cell.b)
  );
  rem_affect.forEach(affect_set.add, affect_set);
  return affect_set;
}
function remove_value_cell_update(cell) {
  if (!cell.v) { console.log('BAD remove_value_cell_update'); return [cell]; }
  // update this cell
  let v = cell.v;
  // update affect
  BOARD.affect.rv[cell.r][v] = BOARD.affect.cv[cell.c][v] = BOARD.affect.bv[cell.b][v] = false;

  // find cell unfilled
  let affect_set = new Set();
  BOARD.rc[cell.r].forEach(c => { if (!c.v) affect_set.add(c); });
  BOARD.cr[cell.c].forEach(c => { if (!c.v) affect_set.add(c); });
  BOARD.bi[cell.b].forEach(c => { if (!c.v) affect_set.add(c); });

  // update all candidate for cell
  cell.v = 0;
  add_all_candidate_into_cell(cell);
  // add candidate from cell in affect_set
  affect_set = [...affect_set].filter(c => add_candidate_into_cell(c, v));
  affect_set.push(cell);
  return affect_set;
}
function remove_candidate_from_cell(cell, v, ir = true, ic = true, ib = true) {
  if (Array.isArray(v)) 
  {
    v.forEach(c => remove_candidate_from_cell(cell, c, ir, ic, ib));
    return;
  }

  cell.cand_set(v, false);
  //remove from CandHouse
  if (ir) BOARD.house.r[cell.r].c[v].cell_set(cell.c + 1, false);
  if (ic) BOARD.house.c[cell.c].c[v].cell_set(cell.r + 1, false);
  if (ib) BOARD.house.b[cell.b].c[v].cell_set(cell.i % 9 + 1, false);
}
function add_candidate_into_cell(cell, v) {
  let is_affect = !check_affect(cell, v);

  cell.cand_set(v, is_affect);
  BOARD.house.r[cell.r].c[v].cell_set(cell.c + 1, is_affect);
  BOARD.house.c[cell.c].c[v].cell_set(cell.r + 1, is_affect);
  BOARD.house.b[cell.b].c[v].cell_set(cell.i % 9 + 1, is_affect);
  return is_affect;
}
function add_all_candidate_into_cell(cell) {
  cell.bit_cand = 0;
  ARR19.forEach(v => add_candidate_into_cell(cell, v));
}
function check_affect(cell, v) {
  return BOARD.affect.rv[cell.r][v] || BOARD.affect.cv[cell.c][v] || BOARD.affect.bv[cell.b][v];
}
function check_complete() {
  for (var r = 0; r < 9; ++r)
    for (var c = 0; c < 9; ++c)
      if (!BOARD.rc[r][c].v) return false;
  return true;
}