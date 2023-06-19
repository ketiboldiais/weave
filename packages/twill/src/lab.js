/**
 * @file This file is not included in the source
 * code. Weave is designed in a whole-meal style
 * – we start with what we want the API to look
 * like, then work our way down to implementation.
 * API experiments/mockups are done on this file.
 */

graph({
  a: ["b", "c", "d", "e"],
  b: ["e", "f", "g"],
  e: ["n", "o", "p"],
});

const cos = Math.cos;
const sin = Math.sin;
const π = Math.PI;

const f_matrix_times = (
  [[a, b], [c, d]],
  [x, y],
) => [a * x + b * y, c * x + d * y];
const f_rotate_matrix = (x) => [[cos(x), -sin(x)], [sin(x), cos(x)]];
const f_vec_add = ([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2];

const f_svg_ellipse_arc = ([cx, cy], [rx, ry], [t1, Δ], φ) => {
  Δ = Δ % (2 * π);
  const rotMatrix = f_rotate_matrix(φ);
  const [sX, sY] = f_vec_add(
    f_matrix_times(rotMatrix, [rx * cos(t1), ry * sin(t1)]),
    [cx, cy],
  );
  const [eX, eY] = f_vec_add(
    f_matrix_times(rotMatrix, [rx * cos(t1 + Δ), ry * sin(t1 + Δ)]),
    [cx, cy],
  );
  const fA = (Δ > π) ? 1 : 0;
  const fS = (Δ > 0) ? 1 : 0;
  const path_2wk2r = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  path_2wk2r.setAttribute(
    "d",
    "M " + sX + " " + sY + " A " +
      [rx, ry, φ / (2 * π) * 360, fA, fS, eX, eY].join(" "),
  );
  return path_2wk2r;
};
