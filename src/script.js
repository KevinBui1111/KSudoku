"use strict";

var maxid = 0;
var max_zindex = 0;
var list_note = [];
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
      set_value_cell(this, 0, 1);
    else if (value > 0)
      set_value_cell(this, value, 1);
  });
  $(".btn-note").click(function () {
    this.classList.toggle("active");
  });
});

function set_value_cell(e, value, note) {
  if (!note) {
    if (value == 0)
      e.firstElementChild.innerHTML = '';
    else if (value > 0)
      e.firstElementChild.innerHTML = value;
  }
  else if (value > 0) {
    e.getElementsByClassName('sdk-cand')[value - 1].classList.toggle("is-cand");
  }
}
String.prototype.format = function () {
  var s = this;
  for (var i = 0; i < arguments.length; i++) {
    var reg = new RegExp("\\(p" + i + "\\)", "g");
    s = s.replace(reg, arguments[i]);
  }

  return s;
}
