"use strict";

var note_mode = 0;
var create_mode = 0;
var btn_note, btn_create;
var current_note;
var dic_label = {};
var board = [];

$(document).ready(function () {
  document.querySelectorAll('.sdk-cell').forEach((e, i) => {
    var r = Math.floor(i / 27) * 3 + Math.floor((i % 9) / 3)
      , c = Math.floor(i / 9 % 3) * 3 + i % 3;
    board[r] = board[r] || [];
    board[r][c] = { dom: e, r: r, c: c };
    e.cell = board[r][c];
  });

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
}
function set_mode(note, create) {
  note_mode = note;
  create_mode = create;
  if (note_mode) btn_note.classList.add('active');
  else btn_note.classList.remove('active');

  if (create_mode) btn_create.classList.add('active');
  else btn_create.classList.remove('active');
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
  var rs = Array(9).fill(null).map(() => Array(10)), // ommit 0, count 1..9
    cs = Array(9).fill(null).map(() => Array(10)),
    bs = Array(9).fill(null).map(() => Array(10)),
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
  var rs = Array(9).fill(null).map(() => Array(10)), // ommit 0, count 1..9
    cs = Array(9).fill(null).map(() => Array(10)),
    bs = Array(9).fill(null).map(() => Array(10));

  //update influence
  for (var r = 0; r < 9; ++r)
    for (var c = 0; c < 9; ++c)
      if (board[r][c].clue) {
        var v = board[r][c].v;
        var b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        rs[r][v] = cs[c][v] = bs[b][v] = true;
      }

  // go through and set candidate for each cell.
  for (var r = 0; r < 9; ++r)
    for (var c = 0; c < 9; ++c)
      if (!board[r][c].clue) {
        board[r][c].v = 0;
        var b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        for (var v = 1; v <= 9; ++v) {
          board[r][c].cand = board[r][c].cand || [];
          board[r][c].cand[v] = !rs[r][v] && !cs[c][v] && !bs[b][v];

          show_cell_candidate(board[r][c].dom, v, board[r][c].cand[v]);
        }
      }
}

function show_cell_candidate(e, v, show) {
  if (show == 1)
    e.getElementsByClassName('sdk-cand')[v - 1].classList.add('is-cand');
  else if (show == 0)
    e.getElementsByClassName('sdk-cand')[v - 1].classList.remove('is-cand');
  else
    e.getElementsByClassName('sdk-cand')[value - 1].classList.toggle("is-cand");
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
