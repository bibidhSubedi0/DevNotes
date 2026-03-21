// ─── Shared layout constants ─────────────────────────────────────────────────
// Edit here only — FileNode, ComponentNode, and App.jsx all import from this.

export const FILE_W          = 360;   // file node default width
export const FILE_W_MIN      = 360;   // minimum resizable width
export const FILE_W_MAX      = 1400;  // maximum resizable width
export const FN_W            = 280;   // function node width
export const FN_GAP_H        = 16;    // horizontal gap between fn columns
export const FN_PAD_H        = 16;    // horizontal padding inside file (each side)
export const FILE_GAP_H      = 16;    // horizontal gap between file columns
export const FILE_GAP_V      = 12;    // vertical gap between files in same column
export const FILE_COLLAPSED_H = 52;   // file height when collapsed
export const FILE_MIN_EXP    = 150;   // file min height when expanded (no fns)
export const FILE_PAD_B      = 14;    // bottom padding inside expanded file

export const FN_SLOT    = 72;   // height per function slot (pill + gap)
export const FN_START_Y = 70;   // y of first fn inside file node

export const COMP_HEADER_H = 58;  // component header height
export const COMP_PAD_H    = 24;  // horizontal padding inside component (each side)
export const COMP_PAD_V    = 20;  // bottom padding
export const COMP_MIN_W    = FILE_W + COMP_PAD_H * 2;  // ~328

export const calcFileH = (fnCount, isCollapsed) =>
  isCollapsed
    ? FILE_COLLAPSED_H
    : Math.max(FILE_MIN_EXP, FN_START_Y + fnCount * FN_SLOT + FILE_PAD_B);

export const fnY = (index) => FN_START_Y + index * FN_SLOT;

// Number of file columns that fit in a given component width
export const calcNumCols = (compWidth) =>
  Math.max(1, Math.floor((compWidth - COMP_PAD_H * 2 + FILE_GAP_H) / (FILE_W + FILE_GAP_H)));

// Full grid layout — returns per-file positions and total component height
export const layoutFiles = (files, allNodes, compWidth) => {
  const numCols  = calcNumCols(compWidth);
  const colNextY = Array.from({ length: numCols }, () => COMP_HEADER_H + FILE_GAP_V);

  const positions = files.map((file) => {
    // place in shortest column
    const col = colNextY.indexOf(Math.min(...colNextY));
    const x   = COMP_PAD_H + col * (FILE_W + FILE_GAP_H);
    const y   = colNextY[col];

    const fnCount     = allNodes.filter(n => n.parentId === file.id && n.type === 'function').length;
    const isCollapsed = file.data?.collapsed === true;
    const h           = calcFileH(fnCount, isCollapsed);

    colNextY[col] += h + FILE_GAP_V;
    return { id: file.id, x, y, height: h };
  });

  const compHeight = Math.max(200, Math.max(...colNextY) + COMP_PAD_V);
  return { positions, compHeight };
};

// ── Function multi-column layout inside a file ────────────────────────────

// How many function columns fit at a given file width
export const calcFnCols = (fileWidth) =>
  Math.max(1, Math.floor((fileWidth - FN_PAD_H * 2 + FN_GAP_H) / (FN_W + FN_GAP_H)));

// Given a list of function nodes and the file width, return:
//   positions: [{ id, x, y }]  — where each fn should be
//   fileHeight: number          — total file height needed
export const layoutFunctions = (fnNodes, fileWidth) => {
  const numCols  = calcFnCols(fileWidth);
  const colNextY = Array.from({ length: numCols }, () => FN_START_Y);

  const positions = fnNodes.map((fn) => {
    const col = colNextY.indexOf(Math.min(...colNextY)); // shortest column
    const x   = FN_PAD_H + col * (FN_W + FN_GAP_H);
    const y   = colNextY[col];
    colNextY[col] += FN_SLOT;
    return { id: fn.id, x, y };
  });

  const fileHeight = Math.max(FILE_MIN_EXP, Math.max(...colNextY) + FILE_PAD_B);
  return { positions, fileHeight };
};