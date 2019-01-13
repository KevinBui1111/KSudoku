function categorize_seed(arr_puzz) {
  var group_seed = [];
  arr_puzz.forEach(p => {
    var gs = group_seed.find(
      g => check_puzzle_seed(g[0], p)
    );
    gs && gs.push(p) || group_seed.push([p]);
  });

  return group_seed;
}
function check_puzzle_seed(p1, p2) {
  return [0, 1, 2, 3, 4, 5, 6, 7]
    .map(o => rotate_puzzle(p2, o))
    .some(o => check_puzzle_same_map_only(p1, o));
}
var chk_count = 0;
function check_puzzle_same_map_only(p1, p2) {
  ++chk_count;
  if (typeof p1 != 'string' || p1.length != 81 ||
    typeof p2 != 'string' || p2.length != 81
  ) return false;

  let map1 = new Map()
    , set2 = new Set();
  for (let i = 0; i < 81; ++i) {
    let v1 = parseInt(p1[i]) | 0
      , v2 = parseInt(p2[i]) | 0;
    // if one of two is 0, break.
    if (!v1 && !v2) continue;
    if (!v1 || !v2) return false;

    if (map1.has(v1)) {
      if (map1.get(v1) != v2) return false;
    }
    else if (set2.has(v2)) return false;
    else {
      map1.set(v1, v2);
      set2.add(v2);
    }
  }
  return true;
}
function rotate_puzzle(p, orient) {
  let board = ARR09.map(r => ARR09.map(c => p[r * 9 + c]))
    , newboard = rotate_matrix(board, orient)
    , newp = newboard.map(r => r.join('')).join('');
  // newboard.forEach(r => r.forEach(c => newp += c));
  return newp;
}
function random_digit_puzzle(p) {
  let origin = [...'123456789']
    , shuff = origin.shuffle_new().join('')
    , map = {}
    , new_puzz = '';
  origin.forEach((c, i) => map[c] = shuff[i]);
  [...p].forEach(c => new_puzz += map[c] || c);

  return { new_puzz, shuff };
}
//==========================================
function rotate_matrix(m, orient) {
  // let m = [
  //   [11, 12, 13],
  //   [21, 22, 23],
  //   [31, 32, 33],
  //   [41, 42, 43],
  //   [51, 52, 53],
  // ];
  let rn = m.length
    , cn = m[0].length
    , ARRC = Array.from(Array(cn))
    , ARRR = Array.from(Array(rn));

  switch (orient) {
    case 0: //90 clockwise
      return ARRC.map((_, c) => ARRR.map((_, r) => m[rn - 1 - r][c]));
    case 1: //90 counter clockwise
      return ARRC.map((_, c) => ARRR.map((_, r) => m[r][cn - 1 - c]));
    case 2: //180
      return ARRR.map((_, r) => ARRC.map((_, c) => m[rn - 1 - r][cn - 1 - c]));
    case 3: // flip vertical
      return ARRR.map((_, r) => ARRC.map((_, c) => m[rn - 1 - r][c]));
    case 4: // flip horizontal
      return ARRR.map((_, r) => ARRC.map((_, c) => m[r][cn - 1 - c]));
    case 5: // flip horizontal & 90 counter clockwise (transpose)
      return ARRC.map((_, c) => ARRR.map((_, r) => m[r][c]));
    case 6: // flip horizontal & 90 clockwise
      return ARRC.map((_, c) => ARRR.map((_, r) => m[rn - 1 - r][cn - 1 - c]));
    case 7: // origin
      return m;
  }
}

Array.prototype.shuffle = function () {
  let len = this.length;
  while (len) {
    let r = ~~(Math.random() * (len--));
    //https://javascript.info/destructuring-assignment
    [this[r], this[len]] = [this[len], this[r]];
  }
  return this;
}
Array.prototype.shuffle_new = function () {
  return [...this].shuffle();
}