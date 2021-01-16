let find_naked_pair = (cnt) => {
  let map_cell = new Map()
    , affect_set = []
    ;

  BOARD.hi.forEach((house, i) => {
    let map_cell = new Map()
      , result_group = []
      ;
    house.forEach(c1 => {
      if (c1.v) return;
      let g = undefined;
      if (g = map_cell.get(c1.bit_cand)) {
        g.push(c1); // add to group

        if (g.length == cnt && c1.cand_ls.length == cnt) {
          result_group.push(g); // add to result set
          map_cell.delete(c1.bit_cand); // remove from map
        }
      }
      else map_cell.set(c1.bit_cand, [c1]);
    });

    result_group.forEach(ps => {
      let affect_cell = [...map_cell.values()].flat().filter(c => c.bit_cand.any_bit(ps[0].cand_ls));
      if (affect_cell.length)
        affect_set.push({
            affect_cell
          , house: BOARD.house.i[i]
          , ps
          , v: ps[0].cand_ls
        });
    });
  });

  affect_set.forEach(p => {
    let ps = '' + p.ps.map(c => c.gi[p.house.type])
      , ac = '' + p.affect_cell.map(c => c.gi[p.house.type]);
    console.log(`Naked pair in cells ${ps} of ${p.house}, affect to cell ${ac}`);
  });
  return affect_set;
}