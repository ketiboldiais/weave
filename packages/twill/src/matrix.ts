import { Line } from "./line.js";
import { Vector } from "./vector.js";

export class Matrix {
  elements: Vector[];
  constructor(elements: Vector[]) {
    this.elements = elements;
  }
	
	MUL() {
	}
	
	/**
	 * Returns true if this matrix
	 * is a square matrix.
	 */
	get isSquare() {
		return this.r === 3;
	}

	/**
	 * Returns the number of rows in this matrix.
	 */
	get r() {
		return this.elements.length;
	}
  /**
   * Returns an array of all the vectors in this
   * matrix as rays. An optional callback may be
   * provided to specify how each ray is
   * rendered.
   */
  rays(
    callback: (v: Line, index: number, element: Vector[]) => Line = (v) => v,
  ) {
    return this.elements.map((v, index, element) => {
      return callback(v.ray(), index, element);
    });
  }
}

export const matrix = (elements: (Vector | number[])[]) => {
  const elems = elements.map((v) => Vector.from(v));
  return new Matrix(elems);
};
