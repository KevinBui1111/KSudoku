"use strict";

var note_mode = 0;
var create_mode = 0;
var btn_note, btn_create;
var ARR09 = [0, 1, 2, 3, 4, 5, 6, 7, 8];
var ARR10 = [, 1, 2, 3, 4, 5, 6, 7, 8, 9];
var block = []
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
var board = [];
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
    var r = Math.floor(i / 27) * 3 + Math.floor((i % 9) / 3)
      , c = Math.floor(i / 9 % 3) * 3 + i % 3
      , b = Math.floor(i / 9);
    board[r] = board[r] || [];
    board[r][c] = {
      dom: e,
      r: r, c: c, b: b, v: undefined, i: i,
      cand: [],
      cand_ls: []
    };
    (block[b] = block[b] || [])[i % 9] = board[r][c];
    e.cell = board[r][c];
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

function set_value_cell(e, value) {
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

function clear_candidate(e) {
  var list_cand = e.getElementsByClassName('is-cand');
  while (list_cand[0]) {
    list_cand[0].classList.remove('is-cand');
  }
}
function import_from_text() {
  var puzzle = document.getElementById('txt-puzzle').value;
  import_puzzle(puzzle);
}
function import_puzzle(puzzle) {
  set_mode(false, true);

  for (var i = 0; i < 81; ++i) {
    var v = parseInt(puzzle[i]) | 0;
    var r = Math.floor(i / 9);
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

function check_stat() {
  var rs = ARR09.map(() => []), // ommit 0, count 1..9
    cs = ARR09.map(() => []),
    bs = ARR09.map(() => []),
    conflict = false;
    ;

  for (var r = 0; r < 9; ++r)
    for (var c = 0; c < 9; ++c) {
      if (board[r][c].clue) {
        var v = board[r][c].v;
        var b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
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
        var b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
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
            cand[v].r[r].push(cell);
            cand[v].c[c].push(cell);
            cand[v].b[cell.b].push(cell);
          }

          show_cell_candidate(cell.dom, v, cell.cand[v]);
        }
      }
}

function find_hs() {
  find_hidden_single();
  //find_naked_single();
  find_hidden_single_all();
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
  [...document.querySelectorAll('.sdk-cell')]
    .map(e => e.cell)
    .filter(c => !c.v && c.cand_ls.length == 1)
    .forEach(c => {
      console.log(`candidate ${c.cand_ls[0].v} is naked single in cell ${c.r}-${c.c}`);
    });
}

function find_first_hidden_single(c) {
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
}
function find_hidden_single_naive(c) {
  var hs = [];

  ARR09.forEach(i => {
    group_check_add_hs(hs, cand[c].b[i], c, 'BLOCK');
    group_check_add_hs(hs, cand[c].r[i], c, 'ROW');
    group_check_add_hs(hs, cand[c].c[i], c, 'COLUMN');
  });

  // return only non empty;
  return hs.filter(n => n);
}
function find_hidden_single_all_naive() {
  var hs = [];

  ARR10.forEach(c =>
    ARR09.forEach(i => {
      group_check_add_hs(hs, cand[c].b[i], c, 'BLOCK');
      group_check_add_hs(hs, cand[c].r[i], c, 'ROW');
      group_check_add_hs(hs, cand[c].c[i], c, 'COLUMN');
    })
  );

  // return only non empty;
  return hs.filter(n => n);
}

function find_hidden_single_at_cell(cell, c) {
  var hs = [];

  group_check_add_hs(hs, cand[c].b[cell.b], 'BLOCK');
  group_check_add_hs(hs, cand[c].r[cell.r], 'ROW');
  group_check_add_hs(hs, cand[c].c[cell.c], 'COLUMN');

  // return only non empty;
  return hs.filter(n => n);
}
function find_hidden_single_all_at_cell(cell) {
  var hs = [];
  var group;

  ARR10.forEach(c => {
    group_check_add_hs(hs, cand[c].b[cell.b], c, 'BLOCK');
    group_check_add_hs(hs, cand[c].r[cell.r], c, 'ROW');
    group_check_add_hs(hs, cand[c].c[cell.c], c, 'COLUMN');
  });
  // return only non empty;
  return hs.filter(n => n);
}

function find_hidden_single_all() {
  //var sel_cand = 7;
  var stack_affect = find_hidden_single_all_naive().map(h => h.cell);
  while (stack_affect.length > 0) {
    var cell = stack_affect.pop();
    console.log(`process cell ${cell.r}-${cell.c}`);
    find_hidden_single_all_at_cell(cell).forEach(h => {
      console.log(`candidate ${h.v} is HS in ${h.group}, cell ${h.cell.r}-${h.cell.c}`);
      var affect = set_value_cell_update(h.cell, h.v);
      console.log(`== remove candidate ${h.v} from cells`);
      affect.forEach(c => console.log(`==== ${c.r}-${c.c}`));
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
  cell.cand_ls.forEach(c => remove_candidate_from_cell(cell, c.v));
  cell.cand_ls = [];
  // remove candidate from block, row, col
  var affect_ls = [];
  ARR09.forEach(i => {
    sub_check_remove_cand(board[cell.r][i]);
    sub_check_remove_cand(board[i][cell.c]);
    sub_check_remove_cand(block[cell.b][i]);
  });

  function sub_check_remove_cand(c) {
    if (!c.v && c.cand[v]) {
      affect_ls.push(c);
      remove_candidate_from_cell(c, v);
    }
  }

  return affect_ls;
}
function remove_candidate_from_cell(c, v) {
  c.cand[v] = false;
  c.cand_ls.remove(cand[v]);

  cand[v].r[c.r].remove(c);
  cand[v].c[c.c].remove(c);
  cand[v].b[c.b].remove(c);

  //remove from view
  show_cell_candidate(c.dom, v, 0);
}
function group_check_add_hs(hs, group, v, group_txt) {
  if (group.length == 1) {
    hs[group[0].i] = hs[group[0].i] || { cell: group[0], v: v, group: [] };
    hs[group[0].i].group.push(group_txt);
  }
}

function show_cell_candidate(e, v, show) {
  if (show == 1)
    e.getElementsByClassName('sdk-cand')[v - 1].classList.add('is-cand');
  else if (show == 0)
    e.getElementsByClassName('sdk-cand')[v - 1].classList.remove('is-cand');
  else
    e.getElementsByClassName('sdk-cand')[v - 1].classList.toggle("is-cand");
}
function reset_candidate() {
  cand = ARR10.map(i => ({
    v: i,
    r: ARR09.map(_ => []),
    c: ARR09.map(_ => []),
    b: ARR09.map(_ => []),
  }));
}
//=============================================================
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