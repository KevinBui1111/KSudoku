function check_puzzle_same(p1, p2) {
  if (typeof p1 != 'string' || p1.length != 81 ||
    typeof p2 != 'string' || p2.length != 81
  ) return;

  let map1 = new Map()
     ,set2 = new Set();
  for (var i = 0; i < 81; ++i) {
    let v1 = parseInt(p1[i]) | 0
       ,v2 = parseInt(p2[i]) | 0;
    // if one of two is 0, return false.
    // if ((v1 != 0) ^ (v2 != 0)) return false;

    // if (map1.has(v1)) {
    //   if (map1.get(v1) != v2) return false;
    // }
    // else if (set2.has(v2)) return false;
    // else {
    //   map1.set(v1, v2);
    //   set2.add(v2);
    // }

    if (!v1 && !v2) continue;
    if (!v1 || !v2) return false;

    if (map1[v1]) {
      if (map1[v1] != v2) return false;
    }
    else if (set2[v2]) return false;
    else {
      map1[v1] = v2;
      set2[v2] = true;
    }
  }

  return i;
}

function rotate_puzzle(p1) {
  if (typeof p1 != 'string' || p1.length != 81 ||
    typeof p2 != 'string' || p2.length != 81
  )
  return;
}
