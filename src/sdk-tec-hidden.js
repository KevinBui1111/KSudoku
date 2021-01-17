let find_hidden_pair = (cnt) => {
  let affect_set = [];

  BOARD.house.i.forEach((house, i) => {
    let map_hc = new Map()
      , result_group = []
      ;
    house.c.forEach(ch => {
      if (ch.bit_cell === 0) return;
      let g = undefined;
      if (g = map_hc.get(ch.bit_cell)) {
        g.push(ch); // add to group

        if (g.length === cnt && ch.length === cnt) {
          result_group.push(g); // add to result set
          map_hc.delete(ch.bit_cell); // remove from map
        }
      }
      else map_hc.set(ch.bit_cell, [ch]);
    });

    result_group.forEach(ps => {
      let affect_v = [...map_hc.values()].flat()
          .filter(ch => ch.bit_cell.any_bit(ps[0].cell_idx_ls))
          .map(ch => ch.v)
        ;
      if (affect_v.length)
        affect_set.push({
            affect_cell: ps[0].cell_ls
          , affect_idx_cell: ps[0].cell_idx_ls
          , house
          , ps: ps.map(ch => ch.v)
          , v: affect_v
        });
    });
  });

  affect_set.forEach(p => {
    console.log(`Hidden set ${p.ps} in cells ${p.affect_idx_cell} of ${p.house}, eliminate candidates  ${p.v}`);
  });
  return affect_set;
}