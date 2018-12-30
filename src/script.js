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
    console.log(event.keyCode + ' - ' + event.which + ' - ' + event.ctrlKey);

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
  });
});

function set_value_cell(e, value) {
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
    e.getElementsByClassName('sdk-cand')[value - 1].classList.toggle("is-cand");
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
    var v = puzzle[i];
    var r = Math.floor(i / 9);
    var c = i % 9;
    var cell = board[r][c];
    cell.r = r;
    cell.c = c;
    cell.clue = true;
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

String.prototype.format = function () {
  var s = this;
  for (var i = 0; i < arguments.length; i++) {
    var reg = new RegExp("\\(p" + i + "\\)", "g");
    s = s.replace(reg, arguments[i]);
  }

  return s;
}
