import { latex, v3, Vector } from "./index.js";

export class Matrix {
  vectors: Vector[] = [];
  /** The number of rows in this matrix. */
  R: number;
  /** The number of columns in this matrix. */
  C: number;
  constructor(R: number, C: number, vectors?: Vector[]) {
    this.R = R;
    this.C = C;
    if (vectors) {
      for (let i = 0; i < vectors.length; i++) {
        const v = vectors[i];
        if (v.order === C) {
          this.vectors.push(v);
        } else this.vectors.push(Vector.fill(C, 0));
      }
    } else {
      for (let i = 0; i < R; i++) {
        this.vectors.push(Vector.zero(C));
      }
    }
  }
  
  get square() {
    return this.C === this.R;
  }

  /**
   * Returns a copy of this matrix.
   */
  copy() {
    const vs = this.vectors.map((v) => v.copy());
    return new Matrix(this.R, this.C, vs);
  }

  /**
   * __Mutating method__. Sets the element at the given
   * row index and column index. The row and column indices
   * are expected to begin at 1. If no element exists
   * at the provided indices, no change is done.
   */
  set(rowIndex: number, columnIndex: number, value: number) {
    if (this.vectors[rowIndex - 1] === undefined) return this;
    if (this.vectors[rowIndex - 1].elements[columnIndex - 1] === undefined) {
      return this;
    }
    this.vectors[rowIndex - 1].elements[columnIndex - 1] = value;
    return this;
  }

  /**
   * Executes the given callback over each element
   * of this matrix. The row and column index provided
   * in the callback begin at 1.
   */
  forEach(
    callback: (
      element: number,
      rowIndex: number,
      columnIndex: number,
    ) => void,
  ) {
    for (let i = 1; i <= this.R; i++) {
      for (let j = 1; j <= this.C; j++) {
        callback(this.n(i, j), i, j);
      }
    }
    return this;
  }

  /**
   * Returns true if this matrix and the
   * the provided matrix have the same
   * number of rows and the same number
   * of columns. False otherwise.
   */
  congruent(matrix: Matrix) {
    return this.R === matrix.R && this.C === matrix.C;
  }

  private matrixOp(other: Matrix, op: (a: number, b: number) => number) {
    if (this.R !== other.R || this.C !== other.C) return this;
    return this.forEach((n, r, c) => {
      this.set(r, c, op(n, other.n(r, c)));
    });
  }

  private scalarOp(other: number, op: (a: number, b: number) => number) {
    return this.forEach((element, r, c) => {
      this.set(r, c, op(element, other));
    });
  }

  private op(
    other: number | (number[])[] | Matrix,
    op: (a: number, b: number) => number,
  ) {
    return (typeof other === "number"
      ? this.scalarOp(other, op)
      : this.matrixOp(
        other instanceof Matrix ? other : Matrix.from(other),
        op,
      ));
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
    return this.op(matrix, (a, b) => a - b);
  }
  
  times(matrix: Matrix | number | (number[])[]) {
    return this.copy().TIMES(matrix)
  }
  
  /**
   * Adds the matrix provided to this matrix..
   */
  TIMES(matrix: Matrix | number | (number[])[]) {
    return this.op(matrix, (a,b) => a + b);
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
    return this.op(matrix, (a, b) => a + b);
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
    return this.scalarOp(-1, (a, b) => a * b);
  }

  array() {
    const out: (number[])[] = [];
    for (let i = 0; i < this.R; i++) {
      const vector = this.vectors[i];
      if (vector) {
        const array = vector.array();
        out.push(array);
      }
    }
    return out;
  }

  /**
   * Returns a nested array where
   * each element is the result
   * of the given callback function.
   */
  to<T>(callback: (n: number) => T) {
    const out: (T[])[] = [];
    for (let i = 0; i <= this.R; i++) {
      const vector = this.vectors[i];
      if (vector) {
        out[i] = [];
        const elems = vector.array();
        elems.forEach((n, j) => {
          out[i][j] = callback(n);
        });
      }
    }
    return out;
  }

  /**
   * Returns the transpose of this matrix
   * in place.
   */
  transpose() {
    const R = this.R;
    const C = this.C;
    const copy: (number[])[] = [];
    for (let i = 0; i < R; ++i) {
      const vector = this.vectors[i];
      for (let j = 0; j < C; ++j) {
        const element = vector.elements[j];
        if (element === undefined) continue;
        if (copy[j] === undefined) copy[j] = [];
        copy[j][i] = element;
      }
    }
    return Matrix.from(copy);
  }

  private toMatrix(other: number | Matrix | (number[])[]): Matrix {
    return (
      typeof other === "number"
        ? Matrix.homogenous(this.R, this.C, other)
        : Array.isArray(other)
        ? Matrix.from(other)
        : other
    );
  }

  /**
   * Returns an array of generic K, where K is the result
   * of applying the callback function on each vector
   * of this matrix.
   */
  vmap<K>(
    callback: (vector: Vector, rowIndex: number, matrix: Matrix) => K,
  ): K[] {
    const out: K[] = [];
    const mtx = this.copy();
    for (let i = 0; i < this.R; i++) {
      const v = this.vectors[i];
      const rowIndex = i + 1;
      const k = callback(v, rowIndex, mtx);
      out.push(k);
    }
    return out;
  }

  /**
   * __Non-mutating method__. Returns the matrix product of this
   * matrix and the provided matrix _in place_.
   */
  mul(arg: number | Matrix | (number[])[]) {
    const Ar = this.R;
    const Ac = this.C;
    if (arg instanceof Matrix && Ac !== arg.R) {
      return this;
    }
    const B = this.toMatrix(arg);
    const Br = B.R;
    const Bc = B.C;
    const result: (number[])[] = [];
    for (let i = 0; i < Ar; i++) {
      result[i] = [];
      for (let j = 0; j < Bc; j++) {
        let sum = 0;
        for (let k = 0; k < Ac; k++) {
          const a = this.vectors[i].elements[k];
          const b = B.vectors[k].elements[j];
          sum += a * b;
        }
        result[i][j] = sum;
      }
    }
    return Matrix.from(result);
  }

  /**
   * Returns true if this matrix and the provided
   * matrix are equal.
   */
  equals(matrix: Matrix) {
    if (!this.congruent(matrix)) return false;
    let out = true;
    this.forEach((n, r, c) => {
      const m = matrix.n(r, c);
      if (m !== n) out = false;
    });
    return out;
  }

  /**
   * Returns the vector at the specified
   * row index. Following mathematical
   * convention, row indices start at 1. If the
   * element is undefined, returns the given
   * fallback (defaults to 0).
   */
  row(rowIndex: number, fallback?: Vector | number[]): Vector {
    const out = this.vectors[rowIndex - 1];
    if (out === undefined) {
      if (fallback !== undefined) return Vector.from(fallback);
      return Vector.fill(this.C, NaN);
    }
    return out;
  }

  /**
   * __MUTATING METHOD__. Sets the vector
   * at row `r` to the provided vector.
   * Row indices start at 1.
   */
  setrow(r: number, vector: Vector) {
    if (this.vectors[r - 1] === undefined) return this;
    this.vectors[r - 1] = vector;
    return this;
  }

  /**
   * Returns the element at the specified
   * row index and column index. Row and column
   * indices start at 1. If the
   * element is undefined, returns the given
   * fallback (defaults to NaN).
   */
  n(rowIndex: number, columnIndex: number, fallback: number = 0): number {
    const out = this.row(rowIndex).n(columnIndex);
    return typeof out === "number" ? out : fallback;
  }

  /**
   * Returns an N×N identity matrix.
   */
  static I(N: number) {
    const out = new Matrix(N, N);
    out.forEach((_, i, j) => {
      if (i === j) out.set(i, j, 1);
      else out.set(i, j, 0);
    });
    return out;
  }

  /**
   * Returns a new R×C zero matrix filled
   * with the given number value.
   */
  static homogenous(R: number, C: number, value: number) {
    const matrix = new Matrix(R, C);
    for (let i = 0; i < R; i++) {
      matrix.vectors[i] = Vector.fill(C, value);
    }
    return matrix;
  }

  /**
   * Returns a new R×C zero matrix.
   */
  static zero(R: number, C: number) {
    return new Matrix(R, C);
  }

  /**
   * Returns a new matrix of the
   * provided vectors.
   */
  static fill(vectors: Vector[]) {
    const C = Vector.maxOrder(vectors);
    const R = vectors.length;
    const matrix = new Matrix(R, C);
    for (let i = 0; i < R; i++) {
      matrix.setrow(i + 1, vectors[i]);
    }
    return matrix;
  }

  /**
   * Returns a new matrix from the given
   * nested array.
   */
  static from(elements: (number[])[]): Matrix {
    const C = maxColumnCount(elements);
    const R = elements.length;
    const matrix = new Matrix(R, C);
    for (let i = 0; i < R; i++) {
      for (let j = 0; j < C; j++) {
        const element = elements[i][j] === undefined ? NaN : elements[i][j];
        matrix.set(i + 1, j + 1, element);
      }
    }
    return matrix;
  }

  /**
   * Returns a new N×N square matrix filled
   * with the provided value.
   */
  static square(N: number, value: number) {
    return Matrix.homogenous(N, N, value);
  }

  static diagonal(diagonal: Vector) {
    const N = diagonal.order;
    const matrix = Matrix.square(N, 0);
    for (let i = 1; i <= N; i++) {
      for (let j = 1; j <= N; j++) {
        if (i !== j) matrix.set(i, j, 0);
        else matrix.set(i, j, diagonal.n(j));
      }
    }
    return matrix;
  }
}

/**
 * Returns the maximum number of columns
 * in the given nested array.
 */
function maxColumnCount<T>(nestedArray: (T[])[]) {
  let C = 0;
  const R = nestedArray.length;
  for (let i = 0; i < R; i++) {
    const row = nestedArray[i];
    const colcount = row.length;
    if (colcount > C) C = colcount;
  }
  return C;
}

export const diagonal = (elements: number[]) =>
  Matrix.diagonal(Vector.from(elements));

export const matrix = (elements: (number[] | Vector)[]) =>
  Matrix.from(elements.map((v) => v instanceof Vector ? v.elements : v));
