"use strict";

let row_possible = Array.from(Array(9), _ => Array(10).fill(true))
  , col_possible = Array.from(Array(9), _ => Array(10).fill(true))
  , blo_possible = Array.from(Array(9), _ => Array(10).fill(true))
  , x_list = []
  , board = []
  , iTry = 0
  , verbose = true
;

function set_possible(v, r, c, on) {
  row_possible[r][v] = on;
  col_possible[c][v] = on;
  blo_possible[~~(r / 3) * 3 + ~~(c / 3)][v] = on;
}

function possible(v, r, c) {
  return row_possible[r][v] &&
    col_possible[c][v] &&
    blo_possible[~~(r / 3) * 3 + ~~(c / 3)][v];
}

function init_board_possible() {
  x_list = [];

  for (let r = 0; r < 9; ++r)
    for (let c = 0; c < 9; ++c) {
      if (!board[r][c]) x_list.push([r, c]);
      set_possible(board[r][c], r, c, board[r][c] === 0)
    }
}

function solve() {
  init_board_possible();
  iTry = 0;
  try_solve(0);
}

function try_solve(start) {
  iTry += 1;

  if (start === x_list.length && verbose) {
    console.info(`Found a solution, iTry ${iTry.toLocaleString()}`);
    print_board(board);
    return;
  }

  let [r, c] = x_list[start];
  for (let v = 1; v < 10; ++v) {
    if (possible(v, r, c)) {
      board[r][c] = v;
      set_possible(v, r, c, false);

      try_solve(start + 1);

      set_possible(v, r, c, true);
      board[r][c] = 0;
    }
  }
}

function print_board(board) {
  for (let r = 0; r < 9; ++r) {
    if (r % 3 === 0 && r > 0)
      console.info('— — — — — — — — — — —');

    let str = '';
    for (let c = 0; c < 9; ++c) {
      if (c % 3 === 0 && c > 0) str += '| ';

      str += board[r][c] === 0 ? ". " : board[r][c] + ' ';
    }

    console.info(str);
  }
}

function build_board(puz) {
  let arr = [...puz].map(c => Number(c) | 0)
  const newArr = [];
  while(arr.length) newArr.push(arr.splice(0,9));
  return newArr;
}

function test(puz) {
  // let  puz = '800000000160040290500006800000000003000100006000200940009500002000081709000007000';
  console.time('solve-backtracking');
  for (let t = 0; t < 1; ++t) {
    board = build_board(puz);
    solve();
  }

  console.info(`Total iTry ${iTry.toLocaleString()}`);
  console.timeEnd('solve-backtracking');
}