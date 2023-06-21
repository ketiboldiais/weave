import { Vector, latex } from "./index.js";

type Mtx = (number[])[];

export class Matrix {
  elements: Mtx;
  constructor(elements: Mtx) {
    this.elements = elements;
  }
  private i(index: number) {
    return index === 0 ? 1 : index - 1;
  }
  
  latex() {
    let txt = `\\begin{bmatrix}`
    const R = this.R;
    const C = this.C;
    for (let i = 0; i < R; i++) {
      for (let j = 0; j < C; j++) {
        const e = this.elements[i][j];
        txt += `${e}`
        if (j !== C-1) {
          txt += `&`
        }
      }
      if (i !== R-1) {
        txt += '\\\\'
      }
    }
    txt+=`\\end{bmatrix}`
    return latex(txt);
  }

  rays() {
    return this.vectors().map((v) => v.ray());
  }

  vectors() {
    const out = this.elements.map((v) => Vector.from(v));
    return out;
  }

  /**
   * Returns true if this matrix and the
   * the provided matrix have the same
   * number of rows and the same number
   * of columns. False otherwise.
   */
  congruent(other: Matrix) {
    return this.R === other.R && this.C === other.C;
  }

  equals(matrix: Matrix | (number[])[]) {
    const other = Array.isArray(matrix) ? new Matrix(matrix) : matrix;
    if (!this.congruent(other)) return false;
    let out = true;
    this.forEach((n, i, j) => {
      const o = other.n(i, j);
      if (o !== n) out = false;
    });
    return out;
  }

  /**
   * Constructs a diagonal matrix from
   * the given diagonal (an array of numbers).
   * @example
   * ~~~
   * const A = Matrix.diagonal([1,1,1]);
   * // A is equivalent to:
   * const B = matrix([
   *  [1,0,0],
   *  [0,1,0],
   *  [0,0,1]
   * ]);
   * ~~~
   */
  static diagonal(diagonal: number[]) {
    const L = diagonal.length;
    const m = Matrix.array(L);
    for (let i = 0; i < L; i++) {
      for (let j = 0; j < L; j++) {
        if (i !== j) {
          m[i][j] = 0;
        } else {
          m[i][j] = diagonal[i];
        }
      }
    }
    return new Matrix(m);
  }

  matrixOp(other: Matrix | number | Mtx, op: (a: number, b: number) => number) {
    const r = this.R;
    const c = this.C;
    const arg = (typeof other === "number") ? Matrix.homog(other, r, c) : (
      Array.isArray(other) ? new Matrix(other) : other
    );
    if (!this.congruent(arg)) return this;
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        const a = this.elements[i][j];
        const b = arg.elements[i][j];
        const n = op(a, b);
        this.elements[i][j] = n;
      }
    }
    return this;
  }

  /**
   * __Non-mutating method__. Subtracts the matrix
   * provided from a copy of this matrix.
   */
  sub(matrix: Matrix | number | (number[])[]) {
    return this.copy().SUB(matrix);
  }

  /**
   * __MUTATING METHOD.__ Subtracts the provided matrix
   * from this matrix _in place_.
   */
  SUB(matrix: Matrix | number | (number[])[]) {
    return this.matrixOp(matrix, (a, b) => a - b);
  }

  /**
   * __Non-mutating method__. Adds the matrix
   * provided to a copy of this matrix.
   */
  add(matrix: Matrix | number | (number[])[]) {
    return this.copy().ADD(matrix);
  }

  /**
   * __MUTATING METHOD.__ Add this matrix and the
   * provided matrix _in place_.
   */
  ADD(matrix: Matrix | number | (number[])[]) {
    return this.matrixOp(matrix, (a, b) => a + b);
  }

  /**
   * __Non-mutating Method__. Transposes a copy of
   * this matrix.
   */
  transpose() {
    return this.copy().TRANSPOSE();
  }

  /**
   * __Mutating Method__. Transposes this matrix
   * in place.
   */
  TRANSPOSE() {
    const copy: Mtx = [];
    const R = this.R;
    const C = this.C;
    for (var i = 0; i < R; ++i) {
      for (var j = 0; j < C; ++j) {
        if (this.elements[i][j] === undefined) continue;
        if (copy[j] === undefined) copy[j] = [];
        copy[j][i] = this.elements[i][j];
      }
    }
    this.elements = copy;
    return this;
  }

  /**
   * Returns an N×N identity matrix.
   */
  static I(N: number) {
    const out = Matrix.zero(N, N)
      .map((_, i, j) => {
        if (i === j) return 1;
        return 0;
      });
    return out;
  }

  /**
   * __Non-mutating method__. Returns the
   * matrix product of the provided matrix
   * and a copy of this matrix.
   */
  mul(other: number | Matrix | (number[])[]) {
    return this.copy().MUL(other);
  }

  /**
   * __MUTATING METHOD__. Returns the matrix product of this
   * matrix and the provided matrix _in place_.
   */
  MUL(other: number | Matrix | (number[])[]) {
    const aRows = this.R;
    const aCols = this.C;
    const arg = (typeof other === "number")
      ? Matrix.homog(other, aRows, aCols)
      : (Array.isArray(other) ? new Matrix(other) : other);
    const bCols = arg.C;
    if (aRows !== bCols) return this;
    const result = new Array(aRows);
    for (let r = 0; r < aRows; ++r) {
      const row = new Array(bCols);
      result[r] = row;
      const ar = this.elements[r];
      for (let c = 0; c < bCols; ++c) {
        let sum = 0;
        for (let i = 0; i < aCols; i++) {
          sum += ar[i] * arg.elements[i][c];
        }
        row[c] = sum;
      }
    }
    this.elements = result;
    return this;
  }

  /**
   * __Non-mutating method__. Returns a negated
   * copy of this matrix.
   */
  neg() {
    return this.copy().NEG();
  }

  /**
   * __MUTATING METHOD__. Negates each element
   * of this matrix in place.
   */
  NEG() {
    this.mut((n) => -n);
    return this;
  }

  /**
   * __Non-mutating method__. Returns the
   * pairwise product of a copy of this matrix and the
   * provided matrix.
   */
  times(other: number | Matrix | (number[])[]) {
    return this.copy().TIMES(other);
  }

  /**
   * __MUTATING METHOD__.
   * Returns the pair-wise product of this
   * matrix and the provided matrix, _in place_.
   */
  TIMES(other: number | Matrix | (number[])[]) {
    return this.matrixOp(other, (a, b) => a * b);
  }

  /**
   * Returns an R×C zero matrix.
   */
  static zero(R: number, C: number) {
    return Matrix.homog(0, R, C);
  }

  /**
   * Returns the element at the specified
   * row index and column index. If the
   * element is undefined, returns the given
   * fallback (defaults to 0).
   */
  n(rowIndex: number, columnIndex: number, fallback: number = 0) {
    const r = this.i(rowIndex);
    const c = this.i(columnIndex);
    const out = this.elements[r][c];
    if (out === undefined) return fallback;
    return out;
  }

  /**
   * __Mutating method__. Sets the element at the given
   * row index and column index. The row and column indices
   * are expected to begin at 1. If no element exists
   * at the provided indices, no change is done.
   */
  set(rowIndex: number, columnIndex: number, value: number) {
    const r = this.i(rowIndex);
    const c = this.i(columnIndex);
    if (this.elements[r][c] !== undefined) {
      this.elements[r][c] = value;
    }
    return this;
  }
  /**
   * Returns the row at the given index.
   * Row indices start at 1.
   */
  row(index: number) {
    const i = this.i(index);
    const out = this.elements[i];
    if (out === undefined) {
      return Array(this.R).fill(0);
    }
    return out;
  }
  /**
   * Returns true if this matrix is a square
   * matrix, false otherwise.
   */
  get isSquare() {
    return this.C === this.R;
  }
  /**
   * Returns a rows × columns matrix, where each
   * element is the provided number value.
   */
  static homog(value: number, rows: number, columns: number) {
    const out: Mtx = [];
    for (let i = 0; i < rows; i++) {
      out.push([]);
    }
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        out[i][j] = value;
      }
    }
    return new Matrix(out);
  }

  /**
   * Returns an empty array of N number arrays.
   */
  static array(N: number) {
    const out: Mtx = [];
    for (let i = 0; i < N; i++) {
      out.push([]);
    }
    return out;
  }
  /**
   * Runs the given callback on each element of this
   * matrix. Both the row index and column index (provided
   * in the callback, start at 1).
   */
  forEach(
    callback: (element: number, rowIndex: number, columnIndex: number) => void,
  ) {
    const r = this.R;
    const c = this.C;
    for (let i = 1; i <= r; i++) {
      for (let j = 1; j <= c; j++) {
        const element = this.n(i, j);
        callback(element, i, j);
      }
    }
    return this;
  }

  /**
   * Returns a copy of this matrix.
   */
  copy() {
    const out = Matrix.array(this.R);
    this.forEach((n, i, j) => {
      out[i - 1][j - 1] = n;
    });
    return new Matrix(out);
  }

  /**
   * Mutates each element of this matrix to the
   * returned number from the given callback.
   * The provided row and column indices begin
   * at 1.
   */
  mut(callback: (n: number, rowIndex: number, columnIndex: number) => number) {
    const R = this.R;
    const C = this.C;
    for (let i = 1; i <= R; i++) {
      for (let j = 1; j <= C; j++) {
        const e = this.n(i, j);
        const n = callback(e, i, j);
        this.elements[i - 1][j - 1] = n;
      }
    }
    return this;
  }

  map(
    callback: (
      n: number,
      rowIndex: number,
      columnIndex: number,
      matrix: Matrix,
    ) => number,
  ) {
    const mtx = this.copy();
    for (let i = 1; i <= mtx.R; i++) {
      for (let j = 1; j <= mtx.C; j++) {
        const element = mtx.n(i, j);
        mtx.elements[i - 1][j - 1] = callback(element, i, j, mtx);
      }
    }
    return mtx;
  }

  /**
   * Returns the number of columns
   * in this matrix.
   */
  get C() {
    return this.elements[0].length;
  }

  /**
   * Returns the number of rows
   * in this matrix.
   */
  get R() {
    return this.elements.length;
  }
}

export const matrix = (elements: (Vector[]) | Mtx): Matrix => {
  const elems = elements.map((v) => v instanceof Vector ? v.array() : v);
  return new Matrix(elems);
};
