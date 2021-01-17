let find_naked_pair = (cnt) => {
  let affect_set = [];

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

let find_naked_triple_ext = (cnt) => {
  let affect_set = [];

  BOARD.hi.forEach((ha, i) => {
    let unclue_bit = 0
      , house = BOARD.house.i[i]
      ;
    ha
       // check cell up to 3 cands
      .filter((c, ci) => {
        if (c.bit_cand) unclue_bit = unclue_bit.onoff_bit(ci + 1, true);
        return c.bit_cand && c.cand_ls.length <= 3;
      })
      .combine(3) // generate combination of 3 cell
      .map(g => { 
        let bit_cand = 0
          , bit_cell = 0;
        g.forEach(c => {
          bit_cand |= c.bit_cand;
          bit_cell |= 1 << c.gi[house.type] - 1;
        });
        return {cells: g, bit_cand, bit_cell};
      })
      .filter(g => get_bit_idx(g.bit_cand).length === 3) // get naked triple group
      .forEach(g => {
        let affect_cell = unclue_bit & ~g.bit_cell; //exclude g
        affect_cell = get_bit_idx(affect_cell).map(idx => ha[idx - 1])
          .filter(c => c.bit_cand & g.bit_cand);
        if (affect_cell.length)
          affect_set.push({
              affect_cell
            , house
            , ps: g.cells
            , v: get_bit_idx(g.bit_cand)
        });
      })
      ;
  });

  affect_set.forEach(p => {
    let ps = '' + p.ps.map(c => c.gi[p.house.type])
      , ac = '' + p.affect_cell.map(c => c.gi[p.house.type]);
    console.log(`Naked triple in cells ${ps} of ${p.house}, affect to cell ${ac}`);
  });
  return affect_set;
}