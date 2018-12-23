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
    console.log(r + ' - ' + c);
    board[r] = board[r] || [];
    board[r][c] = { dom: e, r: r, c: c };
    e.cell = board[r][c];
  });
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
  });
});

String.prototype.format = function () {
  var s = this;
  for (var i = 0; i < arguments.length; i++) {
    var reg = new RegExp("\\(p" + i + "\\)", "g");
    s = s.replace(reg, arguments[i]);
  }

  return s;
}
