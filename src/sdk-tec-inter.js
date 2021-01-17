"use strict";
//==================== Lock Candidate / Intersection ======================
function find_pointing_pair() {
  let affect_set = [];
  ARR19.forEach(v => ARR08.forEach(i => {
    check_pp_gr_cand(affect_set, BOARD.house.b[i].c[v]);
    check_pp_gr_cand(affect_set, BOARD.house.r[i].c[v]);
    check_pp_gr_cand(affect_set, BOARD.house.c[i].c[v]);
  })
  );
  affect_set.forEach(p => {
    console.log(`Candidate ${p.v} only in cells ${p.ps[0].gi[p.check_hc.house.type]}, ${p.ps[1].gi[p.check_hc.house.type]} of ${p.check_hc.house}, affect to ${p.affect_house}`);
  });
  return affect_set;
}
function check_pp_gr_cand(affect_set, hc) {
  if (hc.length != 2)
    return;
  let [ps0, ps1] = hc.cell_ls,
    type_affect = // get type of affect house
      hc.house.type < 2 ?
        ps0.b == ps1.b ? 2 : null :
        ps0.r == ps1.r ? 0 :
          ps0.c == ps1.c ? 1 : null;
  if (type_affect === null)
    return;

  let affect_house = BOARD.house.i[type_affect * 9 + ps0.rcb[type_affect]],
    bit_cell_aff = affect_house.c[hc.v].bit_cell
      .onoff_bit(ps0.gi[type_affect], 0) // exclude ps0
      .onoff_bit(ps1.gi[type_affect], 0) // exclude ps1
    ,
    affect_cell = get_bit_idx(bit_cell_aff).map(i => BOARD.hi[affect_house.id][i - 1]);

  if (bit_cell_aff)
    affect_set.push({
      affect_cell, affect_house,
      ps: [ps0, ps1],
      v: hc.v,
      check_hc: hc
    });
}
function find_pointing_triple() {
  let affect_set = [];
  ARR19.forEach(v => ARR08.forEach(i => {
    check_pt_gr_cand(affect_set, BOARD.house.b[i].c[v]);
    check_pt_gr_cand(affect_set, BOARD.house.r[i].c[v]);
    check_pt_gr_cand(affect_set, BOARD.house.c[i].c[v]);
  })
  );
  affect_set.forEach(p => {
    console.log(`Candidate ${p.v} only in cells ${p.ps[0].gi[p.check_hc.house.type]}, ${p.ps[1].gi[p.check_hc.house.type]}, ${p.ps[2].gi[p.check_hc.house.type]} of ${p.check_hc.house}, affect to ${p.affect_house}`);
  });
  return affect_set;
}
function check_pt_gr_cand(affect_set, hc) {
  if (hc.length != 3)
    return;
  let [ps0, ps1, ps2] = hc.cell_ls,
    type_affect = // get type of affect house
      hc.house.type < 2 ?
        ps0.b == ps1.b && ps1.b == ps2.b ? 2 : null :
        ps0.r == ps1.r && ps1.r == ps2.r ? 0 :
          ps0.c == ps1.c && ps1.c == ps2.c ? 1 : null;
  if (type_affect === null)
    return;

  let affect_house = BOARD.house.i[type_affect * 9 + ps0.rcb[type_affect]],
    bit_cell_aff = affect_house.c[hc.v].bit_cell
      .onoff_bit(ps0.gi[type_affect], 0) // exclude ps0
      .onoff_bit(ps1.gi[type_affect], 0) // exclude ps1
      .onoff_bit(ps2.gi[type_affect], 0) // exclude ps2
    ,
    affect_cell = get_bit_idx(bit_cell_aff).map(i => BOARD.hi[affect_house.id][i - 1]);

  if (bit_cell_aff)
    affect_set.push({
      affect_cell, affect_house,
      ps: [ps0, ps1, ps2],
      v: hc.v,
      check_hc: hc
    });
}
function solve_pointing_set(ps) {
  ps.affect_cell.forEach(c => remove_candidate_from_cell(c, ps.v));
  return ps.affect_cell;
}
