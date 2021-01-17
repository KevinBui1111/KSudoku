"use strict";

let show_ui_mode = false
  , note_mode = 0
  , create_mode = 0
  , btn_note, btn_create, chk_onoff_cand, chk_auto_cand;

$(document).ready(function () {
  document.querySelectorAll('.sdk-cell').forEach((e, i) => {
    let r = ~~(i / 27) * 3 + ~~((i % 9) / 3)
      , b = ~~(i / 9)
      , c = ~~(b % 3) * 3 + i % 3;
    e.cell
      = BOARD.rc[r][c] = BOARD.cr[c][r] = BOARD.bi[b][i % 9] = BOARD.ix[i]
      = BOARD.hi[r][c] = BOARD.hi[c + 9][r] = BOARD.hi[b + 18][i % 9]
      = new Cell(e, r, c, b, i);
  });

  btn_note = document.getElementsByClassName('btn-note')[0];
  btn_create = document.getElementsByClassName('btn-create')[0];
  chk_onoff_cand = document.getElementById('chk-onoff-cand');
  chk_auto_cand = document.getElementById('chk-auto-cand');

  document.querySelector("#chk-show-ui").click();
  document.querySelector("#chk-auto-cand").click();

  $(".sdk-cell").click(function () {
    //$(".sdk-cell").removeClass("selected");
    //$(this).addClass("selected");
  });
  $('.sdk-cell').keydown(function (event) {
    switch (event.keyCode) {
      case 37: // left
        var c = (this.cell.c + 8) % 9;
        var r = c == 8 ? (this.cell.r + 8) % 9 : this.cell.r;
        BOARD.rc[r][c].dom.focus();
        break;

      case 39: // right
        var c = (this.cell.c + 1) % 9;
        var r = c == 0 ? (this.cell.r + 1) % 9 : this.cell.r;
        BOARD.rc[r][c].dom.focus();
        break;

      case 38: // up
        var r = (this.cell.r + 8) % 9;
        var c = r == 8 ? (this.cell.c + 8) % 9 : this.cell.c;
        BOARD.rc[r][c].dom.focus();
        break;

      case 40: // down
        var r = (this.cell.r + 1) % 9;
        var c = r == 0 ? (this.cell.c + 1) % 9 : this.cell.c;
        BOARD.rc[r][c].dom.focus();
        break;
    }

    var value = -1;
    if (48 <= event.keyCode && event.keyCode <= 57) value = event.keyCode - 48;
    if (96 <= event.keyCode && event.keyCode <= 105) value = event.keyCode - 96;

    if (value == 0 || event.keyCode == 8 || event.keyCode == 46) //0, back, delete key
      set_value_cell(this, 0);
    else if (value > 0)
      set_value_cell(this, value);
  });
  $(".btn-note, .btn-create").click(function () {
    this.classList.toggle("active");
    note_mode = btn_note.classList.contains('active');

    if (this == btn_create && create_mode) {
      save_view_to_data();
      let conflict = check_stat();
      if (conflict.length) { // invalid
        this.classList.toggle("active");
        conflict.forEach(c => c.dom.classList.add('conflict'));
      }
      else { // valid
        create_mode = false;
        let puzz = export_puzzle()[0];
        import_puzzle(puzz);
      }
    }
  });
  ui_import_from_text();
});
function show_on_ui(e) {
  show_ui_mode = e.checked;
}
function set_value_cell(e, value) {
  if (!show_ui_mode) return;
  if (!create_mode && e.classList.contains('clue'))
    return;

  e.classList.remove('conflict');
  e.classList.remove('clue');
  value = parseInt(value) | 0;

  if (!note_mode) {
    if (value == 0) {
      e.firstElementChild.innerHTML = '';
      if (!create_mode) ui_remove_value_cell(e);
    }
    else if (value > 0) {
      e.firstElementChild.innerHTML = value;

      if (create_mode) e.classList.add('clue');
      else ui_set_value_cell(e, value);
    }
  }
  else if (value > 0) {
    e.firstElementChild.innerHTML = '';
    ui_toggle_cand(e, value);
  }
}
let ui_toggle_cand = (e, v) => {
  let cand_e = e.getElementsByClassName('sdk-cand')[v - 1].classList.contains('is-cand');
  if (cand_e) {
    remove_candidate_from_cell(e.cell, v);
    show_cell_candidate(e, v, 0);
  }
  else ui_set_cand_cell(e, v);
}
let ui_set_cand_cell = (e, v) => {
  let _
    , rem_affect = e.cell.v ? remove_value_cell_update(e.cell) : []
    , valid = add_candidate_into_cell(e.cell, v)
    , _0 = ui_update_cell([e.cell, ...rem_affect])
    , _1 = show_cell_candidate(e, v, valid) // force
    ;
}
function show_cell_candidate(e, v, show) {
  if (!show_ui_mode) return;
  if (show == 1)
    e.getElementsByClassName('sdk-cand')[v - 1].classList.add('is-cand');
  else if (show == 0)
    e.getElementsByClassName('sdk-cand')[v - 1].classList.remove('is-cand');
  else
    e.getElementsByClassName('sdk-cand')[v - 1].classList.toggle("is-cand");
}
//=============================================================
function ui_import_from_text() {
  var puzzle = document.getElementById('txt-puzzle').value;
  set_mode(false, true);
  import_puzzle(puzzle);
  // update on ui
  BOARD.ix.forEach(cell =>
    set_value_cell(cell.dom, cell.v)
  );
  set_mode(undefined, false);

  ui_fill_candidate();
}
function ui_auto_candidate() {
  if (chk_auto_cand.checked) {
    chk_onoff_cand.checked = true;
    ui_fill_candidate();
  }
}
function ui_fill_candidate() {
  // go through and set candidate for each cell.
  BOARD.ix
    .filter(c => !c.v)
    .forEach(cell =>
      ARR19.forEach(c => show_cell_candidate(cell.dom, c, cell.cand_check(c) && chk_onoff_cand.checked))
    );
}
function ui_update_cell(cells) {
  cells.forEach(cell => {
    cell.dom.firstElementChild.innerHTML = cell.v > 0 ? cell.v : '';
    if (chk_auto_cand.checked)
      ARR19.forEach(v => show_cell_candidate(cell.dom, v, cell.cand_check(v)));
  });
}
function ui_set_value_cell(e, v) {
  let _
    , rem_affect = e.cell.v ? remove_value_cell_update(e.cell) : []
    , conflict = check_affect(e.cell, v)
    , affect_set = set_value_cell_update_v5(e.cell, v);
  rem_affect.forEach(affect_set.add, affect_set);
  ui_update_cell(affect_set);

  if (conflict) {
    e.firstElementChild.innerHTML = v;
    e.classList.add('conflict');
    console.log('CONFLICT ui_set_value_cell');
  }
}
function ui_remove_value_cell(e) {
  let affect_cells = remove_value_cell_update(e.cell);
  ui_update_cell(affect_cells);
}
function set_mode(note, create) {
  if (note != null) {
    note_mode = note;
    if (note_mode) btn_note.classList.add('active');
    else btn_note.classList.remove('active');
  }
  if (create != null) {
    create_mode = create;
    if (create_mode) btn_create.classList.add('active');
    else btn_create.classList.remove('active');
  }
}
function save_view_to_data() {
  document.querySelectorAll('.sdk-cell').forEach((e, i) => {
    var clue = e.classList.contains('clue');
    var v = parseInt(e.firstElementChild.innerHTML) | 0;
    e.cell.clue = clue;
    e.cell.v = v;
  });
}
function export_puzzle() {
  let ex_clue = ''
    , ex_val = '';
  for (let r = 0; r < 9; ++r)
    for (let c = 0; c < 9; ++c) {
      ex_clue += BOARD.rc[r][c].clue ? BOARD.rc[r][c].v : '.';
      ex_val += BOARD.rc[r][c].v ? BOARD.rc[r][c].v : '.';
    }

  return [ex_clue, ex_val];
}

function find_naked_single() {
  let found = true;
  while (found) {
    // console.log('--------');
    let ns_ls = find_naked_single_one();
    ns_ls.forEach(h => set_value_cell_update_v5(h.cell, h.v));
    found = ns_ls.length;
  }
}
function find_naked_single_one() {
  return BOARD.ix
    .filter(c => !c.v && c.cand_ls.length == 1)
    .map(c => ({ cell: c, v: c.cand_ls[0] }));
}

function find_hidden_single_all_naive() {
  let affect_map = new Map();

  ARR19.forEach(v =>
    ARR08.forEach(i => {
      group_check_add_hs(affect_map, BOARD.house.b[i].c[v]);
      group_check_add_hs(affect_map, BOARD.house.r[i].c[v]);
      group_check_add_hs(affect_map, BOARD.house.c[i].c[v]);
    })
  );

  // return only non empty;
  return [...affect_map.values()];
}
function group_check_add_hs(affect_map, hc) {
  if (hc.length == 1) {
    let found = affect_map.get(hc.cell_idx(0)) || { cell: hc.cell_idx(0), v: hc.v, group: [] };
    found.group.push(hc.house.name);
    affect_map.set(hc.cell_idx(0), found);
  }
}
//==================== Lock Candidate / Intersection ======================
function find_pointing_pair() {
  let affect_set = [];
  ARR19.forEach(v =>
    ARR08.forEach(i => {
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
  if (hc.length != 2) return;
  let [ps0, ps1] = hc.cell_ls
    , type_affect = // get type of affect house
        hc.house.type < 2 ?
          ps0.b == ps1.b ? 2 : null :
          ps0.r == ps1.r ? 0 :
            ps0.c == ps1.c ? 1 : null
    ;
  if (type_affect === null) return;
  
  let affect_house = BOARD.house.i[type_affect * 9 + ps0.rcb[type_affect]]
    , bit_cell_aff = affect_house.c[hc.v].bit_cell
      .onoff_bit(ps0.gi[type_affect], 0) // exclude ps0
      .onoff_bit(ps1.gi[type_affect], 0) // exclude ps1
    , affect_cell = get_bit_idx(bit_cell_aff).map(i => BOARD.hi[affect_house.id][i - 1])
    ;

  if (bit_cell_aff)
    affect_set.push({
        affect_cell, affect_house
      , ps: [ps0, ps1]
      , v: hc.v
      , check_hc: hc
    });
}
function find_pointing_triple() {
  let affect_set = [];
  ARR19.forEach(v =>
    ARR08.forEach(i => {
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
  if (hc.length != 3) return;
  let [ps0, ps1, ps2] = hc.cell_ls
    , type_affect = // get type of affect house
        hc.house.type < 2 ?
          ps0.b == ps1.b && ps1.b == ps2.b ? 2 : null :
          ps0.r == ps1.r && ps1.r == ps2.r ? 0 :
            ps0.c == ps1.c && ps1.c == ps2.c ? 1 : null
  ;
  if (type_affect === null) return;

  let affect_house = BOARD.house.i[type_affect * 9 + ps0.rcb[type_affect]]
    , bit_cell_aff = affect_house.c[hc.v].bit_cell
      .onoff_bit(ps0.gi[type_affect], 0) // exclude ps0
      .onoff_bit(ps1.gi[type_affect], 0) // exclude ps1
      .onoff_bit(ps2.gi[type_affect], 0) // exclude ps2
    , affect_cell = get_bit_idx(bit_cell_aff).map(i => BOARD.hi[affect_house.id][i - 1])
    ;

  if (bit_cell_aff)
    affect_set.push({
        affect_cell, affect_house
      , ps: [ps0, ps1, ps2]
      , v: hc.v
      , check_hc: hc
    });
}
function solve_pointing_set(ps) {
  ps.affect_cell.forEach(c => remove_candidate_from_cell(c, ps.v));
  return ps.affect_cell;
}
//==========================================
function solve_with_technique(ehs, ens, epp, ept, np, nt) {
  let found = true
    , affect_cell = new Set();
  while (found) {
    found = false;
    console.log('--------');
    let solved_ls = [];
    if (ehs)
      solved_ls = find_hidden_single_all_naive();
    if (!solved_ls.length && ens)
      solved_ls = find_naked_single_one();

    solved_ls.forEach(h => set_value_cell_update_v5(h.cell, h.v).add_to_set(affect_cell));

    if (!solved_ls.length && epp) {
      solved_ls = find_pointing_pair();
      solved_ls.forEach(ps => solve_pointing_set(ps).add_to_set(affect_cell));
    }

    if (!solved_ls.length && ept) {
      solved_ls = find_pointing_triple();
      solved_ls.forEach(ps => solve_pointing_set(ps).add_to_set(affect_cell));
    }

    if (!solved_ls.length && np) {
      solved_ls = find_naked_pair(2);
      solved_ls.forEach(ps => solve_pointing_set(ps).add_to_set(affect_cell));
    }

    if (!solved_ls.length && nt) {
      solved_ls = find_naked_triple_ext();
      solved_ls.forEach(ps => solve_pointing_set(ps).add_to_set(affect_cell));
    }

    found = solved_ls.length;

    ui_update_cell(affect_cell);
    debugger;
  }
  return affect_cell;
}
//==========================================
String.prototype.format = function () {
  var s = this;
  for (var i = 0; i < arguments.length; i++) {
    var reg = new RegExp("\\(p" + i + "\\)", "g");
    s = s.replace(reg, arguments[i]);
  }

  return s;
}
Array.prototype.remove = function (e) {
  for (var i = 0; i < this.length; ++i)
    if (this[i] == e) {
      this.splice(i, 1);
      return this;
    }
  return this;
}