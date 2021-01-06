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
    board[r] = board[r] || [];
    seqcell[i] = e.cell = board[r][c] = new Cell(e, r, c, b, i);
  });

  btn_note = document.getElementsByClassName('btn-note')[0];
  btn_create = document.getElementsByClassName('btn-create')[0];
  chk_onoff_cand = document.getElementById('chk-onoff-cand');
  chk_auto_cand = document.getElementById('chk-auto-cand');

  document.querySelector("#chk-show-ui").click();

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
    clear_candidate(e);

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

function clear_candidate(e) {
  var list_cand = e.getElementsByClassName('is-cand');
  while (list_cand[0]) {
    list_cand[0].classList.remove('is-cand');
  }
}
//=============================================================
function ui_import_from_text() {
  var puzzle = document.getElementById('txt-puzzle').value;
  set_mode(false, true);
  import_puzzle(puzzle);
  // update on ui
  seqcell.forEach(cell =>
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
  seqcell
    .filter(c => !c.v)
    .forEach(cell =>
      ARR19.forEach(c => show_cell_candidate(cell.dom, c, cell.cand[c] && chk_onoff_cand.checked)
    )
  );
}
function ui_update_cell(cells) {
  cells.forEach(cell => {
    cell.dom.firstElementChild.innerHTML = cell.v > 0 ? cell.v : '';
    if (chk_auto_cand.checked)
      ARR19.forEach(v => show_cell_candidate(cell.dom, v, cell.cand[v]));
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
      ex_clue += board[r][c].clue ? board[r][c].v : '.';
      ex_val += board[r][c].v ? board[r][c].v : '.';
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
  return seqcell
    .filter(c => !c.v && c.cand_ls.length == 1)
    .map(c => ({ cell: c, v: c.cand_ls[0].v }));
}

function find_hidden_single_all_naive() {
  var hs = [];

  ARR19.forEach(c =>
    ARR08.forEach(i => {
      group_check_add_hs(hs, cand[c].b[i], c);
      group_check_add_hs(hs, cand[c].r[i], c);
      group_check_add_hs(hs, cand[c].c[i], c);
    })
  );

  // return only non empty;
  return hs.filter(n => n);
}
function group_check_add_hs(hs, group, v) {
  if (group.length == 1) {
    hs[group.cells[0].i] = hs[group.cells[0].i] || { cell: group.cells[0], v: v, group: [] };
    hs[group.cells[0].i].group.push(group.house_name);
  }
}
//==========================================
function find_pointing_pair() {
  let ps = [];
  ARR19.forEach(c =>
    ARR08.forEach(i => {
      check_pp_gr_cand(ps, cand[c].b[i]);
      check_pp_gr_cand(ps, cand[c].r[i]);
      check_pp_gr_cand(ps, cand[c].c[i]);
    })
  );
  ps.forEach(p => {
    console.log(`PP ${p.point_set[0].r}-${p.point_set[0].c} & ${p.point_set[1].r}-${p.point_set[1].c} of candidate ${p.point_v} in ${p.check_gr_type}, affect to ${p.point_gr_type}`);
  });
  return ps;
}
function check_pp_gr_cand(ps, group) {
  let c = group.v;
  if (group.length == 2) {
    let point_set = [group.cells[0], group.cells[1]];
    // same block in a row or column
    if ((group.house_name == 'ROW' || group.house_name == 'COLUMN') && group.cells[0].b == group.cells[1].b) {
      // remove c from other cell in block b
      let point_gr = cand[c].b[group.cells[0].b].cells.filter(
        cell => !point_set.includes(cell) && cell.cand[c]);
      if (point_gr.length)
        ps.push({
          point_gr: point_gr
          , point_gr_type: 'BLOCK'
          , point_set: point_set
          , point_v: c
          , check_gr_type: group.house_name
        });
    }
    if (group.house_name == 'BLOCK') {
      // same row
      if (group.cells[0].r == group.cells[1].r) {
        // remove c from other cell in row r
        let point_gr = cand[c].r[group.cells[0].r].cells.filter(
          cell => !point_set.includes(cell) && cell.cand[c]);
        if (point_gr.length)
          ps.push({
            point_gr: point_gr
            , point_gr_type: 'ROW'
            , point_set: point_set
            , point_v: c
            , check_gr_type: group.house_name
          });
      }
      // same column
      else if (group.cells[0].c == group.cells[1].c) {
        // remove c from other cell in column c
        let point_gr = cand[c].c[group.cells[0].c].cells.filter(
          cell => !point_set.includes(cell) && cell.cand[c]);
        if (point_gr.length)
          ps.push({
            point_gr: point_gr
            , point_gr_type: 'COLUMN'
            , point_set: point_set
            , point_v: c
            , check_gr_type: group.house_name
          });
      }
    }
  }
}
function find_pointing_triple() {
  let ps = [];
  ARR19.forEach(c =>
    ARR08.forEach(i => {
      check_pt_gr_cand(ps, cand[c].b[i], c, 'BLOCK');
      check_pt_gr_cand(ps, cand[c].r[i], c, 'ROW');
      check_pt_gr_cand(ps, cand[c].c[i], c, 'COLUMN');
    })
  );
  ps.forEach(p => {
    console.log(`PT ${p.point_set[0].r}-${p.point_set[0].c}, ${p.point_set[1].r}-${p.point_set[1].c} & ${p.point_set[2].r}-${p.point_set[2].c} of candidate ${p.point_v} in ${p.check_gr_type}, affect to ${p.point_gr_type}`);
  });
  return ps;
}
function check_pt_gr_cand(ps, group, c, t) {
  if (group.length == 3) {
    let point_set = [group[0], group[1], group[2]];
    // same block in a row or column
    if ((t == 'ROW' || t == 'COLUMN') && group[0].b == group[1].b == group[2].b) {
      // remove c from other cell in block b
      let point_gr = cand[c].b[group[0].b].filter(
        cell => !point_set.includes(cell) && cell.cand[c]);
      if (point_gr.length)
        ps.push({
          point_gr: point_gr
          , point_gr_type: 'BLOCK'
          , point_set: point_set
          , point_v: c
          , check_gr_type: t
        });
    }
    if (t == 'BLOCK') {
      // same row
      if (group[0].r == group[1].r == group[2].r) {
        // remove c from other cell in row r
        let point_gr = cand[c].r[group[0].r].filter(
          cell => !point_set.includes(cell) && cell.cand[c]);
        if (point_gr.length)
          ps.push({
            point_gr: point_gr
            , point_gr_type: 'ROW'
            , point_set: point_set
            , point_v: c
            , check_gr_type: t
          });
      }
      // same column
      else if (group[0].c == group[1].c == group[2].c) {
        // remove c from other cell in column c
        let point_gr = cand[c].c[group[0].c].filter(
          cell => !point_set.includes(cell) && cell.cand[c]);
        if (point_gr.length)
          ps.push({
            point_gr: point_gr
            , point_gr_type: 'COLUMN'
            , point_set: point_set
            , point_v: c
            , check_gr_type: t
          });
      }
    }
  }
}
function solve_pointing_set(ps) {
  ps.point_gr.forEach(c => remove_candidate_from_cell(c, ps.point_v));
}
//==========================================
function solve_with_technique(ehs, ens, epp) {
  let found = true;
  while (found) {
    found = false;
    // console.log('--------');
    let solved_ls = [];
    if (ehs)
      solved_ls = find_hidden_single_all_naive();
    if (!solved_ls.length && ens)
      solved_ls = find_naked_single_one();

    solved_ls.forEach(h => set_value_cell_update_v5(h.cell, h.v));

    if (!solved_ls.length && epp) {
      solved_ls = find_pointing_pair();
      if (solved_ls.length)
        solved_ls.forEach(ps => solve_pointing_set(ps));
    }
    found = solved_ls.length;
  }
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