"use strict";

var show_ui_mode = false;
var note_mode = 0;
var create_mode = 0;
var btn_note, btn_create;
var ARR09 = [0, 1, 2, 3, 4, 5, 6, 7, 8];
var ARR10 = [, 1, 2, 3, 4, 5, 6, 7, 8, 9];
/*
  i: index
  type: row/col/block
  id: 0-26 (9 + 9 + 9)
*/
var cand = [];
/*
cand[1..9] {
  v: number 1..9
  r[0..8]: array of board[][], candidate x is present in cells of row y
  c[0..8]: array of board[][], --~~--
  b[0..8]: array of board[][], --~~--
  cell: array of board[][]
}
*/
var board = []
  , seqcell = [];
/* board[r][c] {
  dom: Dom element '.sdk-cell'
  r,c,b,v
  i: number index 0..80
  clue: true/false
  cand[1..9]: true/false
  cand_ls: array of object cand[x]
}
*/

$(document).ready(function () {
  document.querySelectorAll('.sdk-cell').forEach((e, i) => {
    let r = ~~(i / 27) * 3 + ~~((i % 9) / 3)
      , b = ~~(i / 9)
      , c = ~~(b % 3) * 3 + i % 3;
    board[r] = board[r] || [];
    seqcell[i] = e.cell = board[r][c] = new Cell(e, r, c, b, i);
  });

  reset_candidate();

  btn_note = document.getElementsByClassName('btn-note')[0];
  btn_create = document.getElementsByClassName('btn-create')[0];

  $(".sdk-cell").click(function () {
    //$(".sdk-cell").removeClass("selected");
    //$(this).addClass("selected");
  });
  $('.sdk-cell').keydown(function (event) {
    switch (event.keyCode) {
      case 37: // left
        var c = (this.cell.c + 8) % 9;
        var r = c == 8 ? (this.cell.r + 8) % 9 : this.cell.r;
        board[r][c].dom.focus();
        break;

      case 39: // right
        var c = (this.cell.c + 1) % 9;
        var r = c == 0 ? (this.cell.r + 1) % 9 : this.cell.r;
        board[r][c].dom.focus();
        break;

      case 38: // up
        var r = (this.cell.r + 8) % 9;
        var c = r == 8 ? (this.cell.c + 8) % 9 : this.cell.c;
        board[r][c].dom.focus();
        break;

      case 40: // down
        var r = (this.cell.r + 1) % 9;
        var c = r == 0 ? (this.cell.c + 1) % 9 : this.cell.c;
        board[r][c].dom.focus();
        break;
    }

    var value = -1;
    if (48 <= event.keyCode && event.keyCode <= 57) value = event.keyCode - 48;
    if (96 <= event.keyCode && event.keyCode <= 105) value = event.keyCode - 96;

    if (value == 0 || event.keyCode == 8 || event.keyCode == 46)
      set_value_cell(this, 0);
    else if (value > 0)
      set_value_cell(this, value);
  });
  $(".btn-note, .btn-create").click(function () {
    this.classList.toggle("active");
    note_mode = btn_note.classList.contains('active');
    create_mode = btn_create.classList.contains('active');

    if (this == btn_create && !create_mode) {
      save_view_to_data();
      check_stat();
      console.log(export_puzzle());
    }
  });
});
function show_on_ui(e) {
  show_ui_mode = e.checked;
}
function set_value_cell(e, value) {
  if (!show_ui_mode) return;
  if (!create_mode && e.classList.contains('clue'))
    return;

  e.classList.remove('conflict');
  e.classList.remove('clue');
  value = parseInt(value) | 0;

  if (!note_mode) {
    clear_candidate(e);

    if (value == 0)
      e.firstElementChild.innerHTML = '';
    else if (value > 0) {
      e.firstElementChild.innerHTML = value;

      if (create_mode) e.classList.add('clue');
    }
  }
  else if (value > 0) {
    e.firstElementChild.innerHTML = '';
    show_cell_candidate(e, value, 2);
  }
}
function show_cell_candidate(e, v, show) {
  if (!show_ui_mode) return;
  if (show == 1)
    e.getElementsByClassName('sdk-cand')[v - 1].classList.add('is-cand');
  else if (show == 0)
    e.getElementsByClassName('sdk-cand')[v - 1].classList.remove('is-cand');
  else
    e.getElementsByClassName('sdk-cand')[v - 1].classList.toggle("is-cand");
}
function reset_candidate() {
  cand = ARR10.map(i => new Candidate(i));
}
function clear_candidate(e) {
  var list_cand = e.getElementsByClassName('is-cand');
  while (list_cand[0]) {
    list_cand[0].classList.remove('is-cand');
  }
}
//=============================================================
function import_from_text() {
  var puzzle = document.getElementById('txt-puzzle').value;
  import_puzzle(puzzle);
}
function import_puzzle(puzzle) {
  set_mode(false, true);

  for (var i = 0; i < 81; ++i) {
    var v = parseInt(puzzle[i]) | 0;
    var r = ~~(i / 9);
    var c = i % 9;
    var cell = board[r][c];
    cell.v = v;
    cell.clue = v > 0;
    set_value_cell(cell.dom, v);
  }

  set_mode(undefined, false);
}
function set_mode(note, create) {
  if (note != null) {
    note_mode = note;
    if (note_mode) btn_note.classList.add('active');
    else btn_note.classList.remove('active');
  }
  if (create != null) {
    create_mode = create;
    if (create_mode) btn_create.classList.add('active');
    else btn_create.classList.remove('active');
  }
}
function save_view_to_data() {
  document.querySelectorAll('.sdk-cell').forEach((e, i) => {
    var clue = e.classList.contains('clue');
    var v = parseInt(e.firstElementChild.innerHTML) | 0;
    e.cell.clue = clue;
    e.cell.v = v;
  });
}
function export_puzzle() {
  var res = '';
  for (var r = 0; r < 9; ++r)
    for (var c = 0; c < 9; ++c)
      res += (board[r][c].v > 0 && board[r][c].clue) ? board[r][c].v : '.';

  return res;
}
function check_complete() {
  for (var r = 0; r < 9; ++r)
    for (var c = 0; c < 9; ++c)
      if (!board[r][c].v) return false;
  return true;
}
function check_stat() {
  var rs = ARR09.map(() => []), // ommit 0, count 1..9
    cs = ARR09.map(() => []),
    bs = ARR09.map(() => []),
    conflict = false;
  ;

  for (var r = 0; r < 9; ++r)
    for (var c = 0; c < 9; ++c) {
      var v;
      if (v = board[r][c].v) {
        var b = ~~(r / 3) * 3 + ~~(c / 3);
        if (rs[r][v] || cs[c][v] || bs[b][v]) {
          // conflict
          conflict = true;
          board[r][c].dom.classList.add('conflict');
        }
        else
          rs[r][v] = cs[c][v] = bs[b][v] = true;
      }
    }
  return conflict;
}
function fill_candidate() {
  var rs = ARR09.map(() => []), // ommit 0, count 1..9
    cs = ARR09.map(() => []),
    bs = ARR09.map(() => []);

  //update influence
  for (var r = 0; r < 9; ++r)
    for (var c = 0; c < 9; ++c)
      if (board[r][c].clue) {
        var v = board[r][c].v;
        var b = ~~(r / 3) * 3 + ~~(c / 3);
        rs[r][v] = cs[c][v] = bs[b][v] = true;
      }

  reset_candidate();

  // go through and set candidate for each cell.
  for (var r = 0; r < 9; ++r)
    for (var c = 0; c < 9; ++c)
      if (!board[r][c].clue) {
        var cell = board[r][c];
        cell.v = 0;
        cell.cand_ls = [];
        for (var v = 1; v <= 9; ++v) {
          cell.cand[v] = !rs[r][v] && !cs[c][v] && !bs[cell.b][v];

          if (cell.cand[v]) {
            cell.cand_ls.push(cand[v]);
            cand[v].r[r].cells.push(cell);
            cand[v].c[c].cells.push(cell);
            cand[v].b[cell.b].cells.push(cell);
          }

          show_cell_candidate(cell.dom, v, cell.cand[v]);
        }
      }
}

function find_hs() {
  // find_hidden_single();
  //find_naked_single();
  find_hidden_single_all_v4();
  check_stat();
}
function find_hidden_single() {
  console.log('-----------------------------');
  cand.forEach(c => {
    find_hidden_single_naive(c.v).forEach(h => {
      console.log(`candidate ${c.v} is HS in ${h.group}, cell ${h.cell.r}-${h.cell.c}`);
    });
  });
}
function find_naked_single() {
  let found = true;
  while (found) {
    // console.log('--------');
    let ns_ls = find_naked_single_one();
    ns_ls.forEach(h => set_value_cell_update_v3(h.cell, h.v));
    found = ns_ls.length;
  }
}
function find_naked_single_one() {
  return seqcell
    .filter(c => !c.v && c.cand_ls.length == 1)
    .map(c => ({ cell: c, v: c.cand_ls[0].v }));
}

/*function find_first_hidden_single(c) {
  var i;
  var first =
    (// search by block first
      (i = ARR09.find(n => cand[c].b[n].length == 1)) != undefined ?
        {
          cell: cand[c].b[i][0],
          group: 'BLOCK'
        }
        : undefined
    )
    ||
    (// search by row
      (i = ARR09.find(n => cand[c].r[n].length == 1)) != undefined ?
        {
          cell: cand[c].r[i][0],
          group: 'ROW'
        }
        : undefined
    )
    ||
    (// search by column
      (i = ARR09.find(n => cand[c].c[n].length == 1)) != undefined ?
        {
          cell: cand[c].c[i][0],
          group: 'COLUMN'
        }
        : undefined
    )
    ;
  return first;
}*/
function find_hidden_single_naive(c) {
  var hs = [];

  ARR09.forEach(i => {
    group_check_add_hs(hs, cand[c].b[i], c);
    group_check_add_hs(hs, cand[c].r[i], c);
    group_check_add_hs(hs, cand[c].c[i], c);
  });

  // return only non empty;
  return hs.filter(n => n);
}
function find_hidden_single_all_naive() {
  var hs = [];

  ARR10.forEach(c =>
    ARR09.forEach(i => {
      group_check_add_hs(hs, cand[c].b[i], c);
      group_check_add_hs(hs, cand[c].r[i], c);
      group_check_add_hs(hs, cand[c].c[i], c);
    })
  );

  // return only non empty;
  return hs.filter(n => n);
}

function find_hidden_single_at_cell(cell, c) {
  var hs = [];

  group_check_add_hs(hs, cand[c].b[cell.b], c);
  group_check_add_hs(hs, cand[c].r[cell.r], c);
  group_check_add_hs(hs, cand[c].c[cell.c], c);

  // return only non empty;
  return hs.filter(n => n);
}
function find_hidden_single_all_at_cell(cell) {
  var hs = [];
  var group;

  ARR10.forEach(c => {
    group_check_add_hs(hs, cand[c].b[cell.b], c);
    group_check_add_hs(hs, cand[c].r[cell.r], c);
    group_check_add_hs(hs, cand[c].c[cell.c], c);
  });
  // return only non empty;
  return hs.filter(n => n);
}

function find_hidden_single_all() {
  //var sel_cand = 7;
  var mark_affect = [];
  var stack_affect = find_hidden_single_all_naive().map(h => h.cell)
  stack_affect.forEach(c => mark_affect[c.i] = true);
  while (stack_affect.length > 0) {
    var cell = stack_affect.pop();
    mark_affect[cell.i] = false;
    // console.log(`process cell ${cell.r}-${cell.c}`);
    find_hidden_single_all_at_cell(cell).forEach(h => {
      // console.log(`candidate ${h.v} is HS in ${h.group}, cell ${h.cell.r}-${h.cell.c}`);
      var affect = set_value_cell_update(h.cell, h.v);
      // remove from stack
      if (!mark_affect[h.cell.i]) {
        stack_affect.push(h.cell);
        mark_affect[h.cell.i] = true;
      }
      // console.log(`== remove candidate ${h.v} from cells`);
      // affect.forEach(c => console.log(`==== ${c.r}-${c.c}`));
      affect = affect.filter(c => !mark_affect[c.i]);
      affect.forEach(c => mark_affect[c.i] = true);
      // push to stack
      stack_affect.push.apply(stack_affect, affect);
    });
  }
}
function set_value_cell_update(cell, v) {
  // set in view
  set_value_cell(cell.dom, v);
  // update 
  cell.v = v;
  cell.cand = [];
  cell.cand_ls.map(c => c.v).forEach(c => remove_candidate_from_cell(cell, c));
  cell.cand_ls = [];
  // remove candidate from block, row, col
  var affect_ls = [];
  sub_check_remove_cand(cand[v].r[cell.r]);
  sub_check_remove_cand(cand[v].c[cell.c]);
  sub_check_remove_cand(cand[v].b[cell.b]);

  function sub_check_remove_cand(g) {
    g.map(c => c).forEach(c => {
      affect_ls.push(c);
      remove_candidate_from_cell(c, v);
    });
  }

  return affect_ls;
}
function remove_candidate_from_cell(c, v) {
  c.cand[v] = false;
  c.cand_ls.remove(cand[v]);

  cand[v].r[c.r].cells.remove(c);
  cand[v].c[c.c].cells.remove(c);
  cand[v].b[c.b].cells.remove(c);

  //remove from view
  show_cell_candidate(c.dom, v, 0);
}
function group_check_add_hs(hs, group, v) {
  if (group.length == 1) {
    hs[group.cells[0].i] = hs[group.cells[0].i] || { cell: group.cells[0], v: v, group: [] };
    hs[group.cells[0].i].group.push(group.house_name);
  }
}
//==========================================
function find_hidden_single_all_at_group(group_id) {
  var hs = [];

  ARR10.forEach(c => {
    group_check_add_hs(hs, cand[c].g[group_id], c, cand[c].g[group_id].house_name);
  });
  // return only non empty;
  return hs.filter(n => n);
}
function find_hidden_single_all_v2() {
  var mark_affect = []
    , stack_affect = [];

  find_hidden_single_all_naive().forEach(h => {
    sub_process_hs(h);
  });

  while (stack_affect.length > 0) {
    var group_id = stack_affect.pop();
    mark_affect[group_id] = false;
    // console.log(`process group ${get_group_name(group_id)}`);
    find_hidden_single_all_at_group(group_id).forEach(h => {
      sub_process_hs(h);
    });
  }

  function sub_process_hs(h) {
    // console.log(`candidate ${h.v} is HS in ${h.group}, cell ${h.cell.r}-${h.cell.c}`);
    var affect = set_value_cell_update_v2(h.cell, h.v);

    // console.log('== affect to group:');
    // affect.forEach(c => console.log(`==== ${get_group_name(c)}`));

    // just add new affect to stack
    affect = affect.filter(c => !mark_affect[c]);
    affect.forEach(c => mark_affect[c] = true);

    // push to stack
    stack_affect.push.apply(stack_affect, affect);
  }
}
function set_value_cell_update_v2(cell, v) {
  // set in view
  set_value_cell(cell.dom, v);
  // update 
  cell.v = v;
  cell.cand = [];
  cell.cand_ls.map(c => c.v).forEach(c => remove_candidate_from_cell(cell, c));
  cell.cand_ls = [];
  // remove candidate from block, row, col
  var affect_ls = [], affect = [];
  // ARR09.forEach(i => {
  sub_check_remove_cand(cand[v].r[cell.r]); // column
  sub_check_remove_cand(cand[v].c[cell.c]); // row
  sub_check_remove_cand(cand[v].b[cell.b]); // block
  // });
  // add row, column, block of this cell
  if (!affect_ls[cell.r]) {
    affect_ls[cell.r] = true;
    affect.push(cell.r);
  }
  if (!affect_ls[18 + cell.b]) {
    affect_ls[18 + cell.b] = true;
    affect.push(18 + cell.b);
  }
  if (!affect_ls[9 + cell.c]) {
    affect_ls[9 + cell.c] = true;
    affect.push(9 + cell.c);
  }

  function sub_check_remove_cand(g) {
    let t = g.house_name;
    g.cells.map(c => c).forEach(c => {
      // if (c.v || !c.cand[v]) return;

      if (!affect_ls[c.r] && t != 'ROW') {
        affect_ls[c.r] = true;
        affect.push(c.r);
      }
      if (!affect_ls[9 + c.c] && t != 'COLUMN') {
        affect_ls[9 + c.c] = true;
        affect.push(9 + c.c);
      }
      if (!affect_ls[18 + c.b] && t != 'BLOCK') {
        affect_ls[18 + c.b] = true;
        affect.push(18 + c.b);
      }
      remove_candidate_from_cell(c, v);
    });
  }
  return affect;
}
//==========================================
function find_pointing_pair() {
  let ps = [];
  ARR10.forEach(c =>
    ARR09.forEach(i => {
      check_pp_gr_cand(ps, cand[c].b[i]);
      check_pp_gr_cand(ps, cand[c].r[i]);
      check_pp_gr_cand(ps, cand[c].c[i]);
    })
  );
  ps.forEach(p => {
    console.log(`PP ${p.point_set[0].r}-${p.point_set[0].c} & ${p.point_set[1].r}-${p.point_set[1].c} of candidate ${p.point_v} in ${p.check_gr_type}, affect to ${p.point_gr_type}`);
  });
  return ps;
}
function check_pp_gr_cand(ps, group) {
  let c = group.v;
  if (group.length == 2) {
    let point_set = [group.cells[0], group.cells[1]];
    // same block in a row or column
    if ((group.house_name == 'ROW' || group.house_name == 'COLUMN') && group.cells[0].b == group.cells[1].b) {
      // remove c from other cell in block b
      let point_gr = cand[c].b[group.cells[0].b].cells.filter(
        cell => !point_set.includes(cell) && cell.cand[c]);
      if (point_gr.length)
        ps.push({
          point_gr: point_gr
          , point_gr_type: 'BLOCK'
          , point_set: point_set
          , point_v: c
          , check_gr_type: group.house_name
        });
    }
    if (group.house_name == 'BLOCK') {
      // same row
      if (group.cells[0].r == group.cells[1].r) {
        // remove c from other cell in row r
        let point_gr = cand[c].r[group.cells[0].r].cells.filter(
          cell => !point_set.includes(cell) && cell.cand[c]);
        if (point_gr.length)
          ps.push({
            point_gr: point_gr
            , point_gr_type: 'ROW'
            , point_set: point_set
            , point_v: c
            , check_gr_type: group.house_name
          });
      }
      // same column
      else if (group.cells[0].c == group.cells[1].c) {
        // remove c from other cell in column c
        let point_gr = cand[c].c[group.cells[0].c].cells.filter(
          cell => !point_set.includes(cell) && cell.cand[c]);
        if (point_gr.length)
          ps.push({
            point_gr: point_gr
            , point_gr_type: 'COLUMN'
            , point_set: point_set
            , point_v: c
            , check_gr_type: group.house_name
          });
      }
    }
  }
}
function find_pointing_triple() {
  let ps = [];
  ARR10.forEach(c =>
    ARR09.forEach(i => {
      check_pt_gr_cand(ps, cand[c].b[i], c, 'BLOCK');
      check_pt_gr_cand(ps, cand[c].r[i], c, 'ROW');
      check_pt_gr_cand(ps, cand[c].c[i], c, 'COLUMN');
    })
  );
  ps.forEach(p => {
    console.log(`PT ${p.point_set[0].r}-${p.point_set[0].c}, ${p.point_set[1].r}-${p.point_set[1].c} & ${p.point_set[2].r}-${p.point_set[2].c} of candidate ${p.point_v} in ${p.check_gr_type}, affect to ${p.point_gr_type}`);
  });
  return ps;
}
function check_pt_gr_cand(ps, group, c, t) {
  if (group.length == 3) {
    let point_set = [group[0], group[1], group[2]];
    // same block in a row or column
    if ((t == 'ROW' || t == 'COLUMN') && group[0].b == group[1].b == group[2].b) {
      // remove c from other cell in block b
      let point_gr = cand[c].b[group[0].b].filter(
        cell => !point_set.includes(cell) && cell.cand[c]);
      if (point_gr.length)
        ps.push({
          point_gr: point_gr
          , point_gr_type: 'BLOCK'
          , point_set: point_set
          , point_v: c
          , check_gr_type: t
        });
    }
    if (t == 'BLOCK') {
      // same row
      if (group[0].r == group[1].r == group[2].r) {
        // remove c from other cell in row r
        let point_gr = cand[c].r[group[0].r].filter(
          cell => !point_set.includes(cell) && cell.cand[c]);
        if (point_gr.length)
          ps.push({
            point_gr: point_gr
            , point_gr_type: 'ROW'
            , point_set: point_set
            , point_v: c
            , check_gr_type: t
          });
      }
      // same column
      else if (group[0].c == group[1].c == group[2].c) {
        // remove c from other cell in column c
        let point_gr = cand[c].c[group[0].c].filter(
          cell => !point_set.includes(cell) && cell.cand[c]);
        if (point_gr.length)
          ps.push({
            point_gr: point_gr
            , point_gr_type: 'COLUMN'
            , point_set: point_set
            , point_v: c
            , check_gr_type: t
          });
      }
    }
  }
}
function solve_pointing_set(ps) {
  ps.point_gr.forEach(c => remove_candidate_from_cell(c, ps.point_v));
}
//============Fastest and most naive=======================
function find_hidden_single_all_v3() {
  var found = true;
  while (found) {
    found = false;
    // console.log('--------');
    let hs_ls = find_hidden_single_all_naive();
    found = hs_ls.length > 0;
    hs_ls.forEach(h => {
      // console.log(`candidate ${h.v} is HS in ${h.group}, cell ${h.cell.r}-${h.cell.c}`);
      set_value_cell_update_v3(h.cell, h.v);
    });
  }
}
function set_value_cell_update_v3(cell, v) {
  // set in view
  set_value_cell(cell.dom, v);
  // update 
  cell.v = v;
  cell.cand = [];
  cell.cand_ls.map(c => c.v).forEach(c => remove_candidate_from_cell(cell, c));
  cell.cand_ls = [];
  // remove candidate from block, row, col
  sub_check_remove_cand(cand[v].r[cell.r]);
  sub_check_remove_cand(cand[v].c[cell.c]);
  sub_check_remove_cand(cand[v].b[cell.b]);

  function sub_check_remove_cand(g) {
    g.cells.map(c => c).forEach(c => {
      if (c.cand[v]) remove_candidate_from_cell(c, v);
    });
  }
}
//============Slowest and most customize================
function find_hidden_single_at_group(group_id) {
  var hs = [];
  var v = group_id / 27 | 0;
  var group_c_id = group_id % 27;
  var group = cand[v].g[group_c_id];

  if (group.length == 1)
    return { cell: group.cells[0], v: v, group: [group.house_name] };
}
function find_hidden_single_all_v4() {
  var mark_affect = []
    , stack_affect = [];

  find_hidden_single_all_naive().forEach(h => {
    sub_process_hs(h);
  });
  //cand[v].b[n] = v * (18 + n) = v * g
  while (stack_affect.length > 0) {
    var group_id = stack_affect.pop();
    mark_affect[group_id] = false;
    // console.log(`process group ${get_group_name(group_id)}`);
    var h = find_hidden_single_at_group(group_id);
    if (h) sub_process_hs(h);
  }

  function sub_process_hs(h) {
    // console.log(`candidate ${h.v} is HS in ${h.group}, cell ${h.cell.r}-${h.cell.c}`);
    var affect = set_value_cell_update_v4(h.cell, h.v);

    // console.log('== affect to group:');
    // affect.forEach(c => console.log(`==== ${get_group_name(c)}`));

    // just add new affect to stack
    affect = affect.filter(c => !mark_affect[c]);
    affect.forEach(c => mark_affect[c] = true);

    // push to stack
    stack_affect.push.apply(stack_affect, affect);
  }
}
function set_value_cell_update_v4(cell, v) {
  var affect_ls = [], affect = [];
  // set in view
  set_value_cell(cell.dom, v);
  // update 
  cell.v = v;
  cell.cand = [];
  cell.cand_ls.map(c => c.v).forEach(c => {
    sub_add_group_affect(c);
    remove_candidate_from_cell(cell, c);
  });
  cell.cand_ls = [];
  // remove candidate from block, row, col
  // ARR09.forEach(i => {
  sub_check_remove_cand(cand[v].r[cell.r]); // column
  sub_check_remove_cand(cand[v].c[cell.c]); // row
  sub_check_remove_cand(cand[v].b[cell.b]); // block
  // });
  // add row, column, block of this cell
  sub_add_group_affect(v);

  function sub_add_group_affect(c) {
    if (!affect_ls[c * 27 + cell.r]) {
      affect_ls[c * 27 + cell.r] = true;
      affect.push(c * 27 + cell.r);
    }
    if (!affect_ls[c * 27 + 18 + cell.b]) {
      affect_ls[c * 27 + 18 + cell.b] = true;
      affect.push(c * 27 + 18 + cell.b);
    }
    if (!affect_ls[c * 27 + 9 + cell.c]) {
      affect_ls[c * 27 + 9 + cell.c] = true;
      affect.push(c * 27 + 9 + cell.c);
    }
  }

  function sub_check_remove_cand(g) {
    let t = g.house_name;
    g.cells.map(c => c).forEach(c => {
      // if (c.v || !c.cand[v]) return;

      if (!affect_ls[v * 27 + c.r] && t != 'ROW') {
        affect_ls[v * 27 + c.r] = true;
        affect.push(v * 27 + c.r);
      }
      if (!affect_ls[v * 27 + 9 + c.c] && t != 'COLUMN') {
        affect_ls[v * 27 + 9 + c.c] = true;
        affect.push(v * 27 + 9 + c.c);
      }
      if (!affect_ls[v * 27 + 18 + c.b] && t != 'BLOCK') {
        affect_ls[v * 27 + 18 + c.b] = true;
        affect.push(v * 27 + 18 + c.b);
      }
      remove_candidate_from_cell(c, v);
    });
  }
  return affect;
}
//==========================================
function solve_with_technique(ehs, ens, epp) {
  let found = true;
  while (found) {
    found = false;
    // console.log('--------');
    let solved_ls = [];
    if (ehs)
      solved_ls = find_hidden_single_all_naive();
    if (!solved_ls.length && ens)
      solved_ls = find_naked_single_one();

    solved_ls.forEach(h => set_value_cell_update_v3(h.cell, h.v));

    if (!solved_ls.length && epp) {
      solved_ls = find_pointing_pair();
      if (solved_ls.length)
        solved_ls.forEach(ps => solve_pointing_set(ps));
    }
    found = solved_ls.length;
  }
}
//==========================================
String.prototype.format = function () {
  var s = this;
  for (var i = 0; i < arguments.length; i++) {
    var reg = new RegExp("\\(p" + i + "\\)", "g");
    s = s.replace(reg, arguments[i]);
  }

  return s;
}
Array.prototype.remove = function (e) {
  for (var i = 0; i < this.length; ++i)
    if (this[i] == e) {
      this.splice(i, 1);
      return this;
    }
  return this;
}