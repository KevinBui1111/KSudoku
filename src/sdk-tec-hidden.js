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

let find_hidden_triple_ext = (cnt) => {
  let affect_set = [];

  BOARD.house.i.forEach(house => {
    let unclue_bit = 0;
    house.c
      .filter(ch =>{
        if (ch.bit_cell) unclue_bit = unclue_bit.onoff_bit(ch.v, true);
        return ch.bit_cell && ch.length <= 3
      })
      .combine(3) // generate combination of 3 cell
      .map(g => { 
        let bit_cand = 0
          , bit_cell = 0;
        g.forEach(ch => {
          bit_cell |= ch.bit_cell;
          bit_cand |= bit_cand.onoff_bit(ch.v, true);
        });
        return {cells: g, bit_cand, bit_cell};
      })
      .filter(g => get_bit_idx(g.bit_cell).length === 3) // get naked triple group
      .forEach(g => {
        let affect_cand = unclue_bit & ~g.bit_cand; //exclude g
        affect_cand = get_bit_idx(affect_cand).map(v => house.c[v])
          .filter(c => c.bit_cell & g.bit_cell);
        if (affect_cand.length)
          affect_set.push({
              affect_cell: get_bit_idx(g.bit_cell).map(i => BOARD.hi[house.id][i - 1])
            , affect_idx_cell: get_bit_idx(g.bit_cell)
            , house
            , ps: get_bit_idx(g.bit_cand)
            , v: affect_cand.map(ch => ch.v)
        });
      })
      ;
  });

  affect_set.forEach(p => {
    console.log(`Hidden set ${p.ps} in cells ${p.affect_idx_cell} of ${p.house}, eliminate candidates  ${p.v}`);
  });
  return affect_set;
}