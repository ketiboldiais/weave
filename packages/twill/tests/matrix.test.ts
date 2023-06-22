import { describe, expect, it } from "vitest";
import { Matrix, diagonal, matrix } from "../src/index.js";

describe("matrix", () => {
  it("should return a copy of the matrix.", () => {
    const A = matrix([
      [1, 2, 3],
      [4, 5, 6],
      [5, 7, 8],
    ]);
    const B = A.copy();
    expect(A).toEqual(B);
  });
  it("should return a homogenous matrix.", () => {
    const A = matrix([
      [7, 7, 7],
      [7, 7, 7],
      [7, 7, 7],
    ]);
    const B = Matrix.homogenous(3,3,7);
    expect(A).toEqual(B);
  });
  it("should return true for a square matrix.", () => {
    const A = matrix([
      [7, 7, 7],
      [7, 7, 7],
      [7, 7, 7],
    ]).square;
    const B = true;
    expect(A).toEqual(B);
  });
  it("should return false for a non-square matrix.", () => {
    const A = matrix([
      [7, 2, 7, 3],
      [8, 7, 7, 3],
      [7, 1, 7, 3],
    ]).square;
    const B = false;
    expect(A).toEqual(B);
  });
  it("should map the matrix.", () => {
    const A = matrix([
      [7, 2, 7, 3],
      [8, 0, 1, 3],
      [7, 1, 7, 3],
    ]).map((n) => n + 1);
    const B = matrix([
      [8, 3, 8, 4],
      [9, 1, 2, 4],
      [8, 2, 8, 4],
    ]);
    expect(A).toEqual(B);
  });
  it("should return an identity matrix of the given order.", () => {
    const A = Matrix.I(4);
    const B = matrix([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]);
    expect(A).toEqual(B);
  });
  it("should add a scalar to the given matrix in place.", () => {
    const A = matrix([
      [1, 2, 1],
      [0, 3, 7],
      [4, 2, 8],
    ]).add(1);
    const B = matrix([
      [2, 3, 2],
      [1, 4, 8],
      [5, 3, 9],
    ]);
    expect(A).toEqual(B);
  });
  it("should construct a diagonal matrix from the given array.", () => {
    const A = diagonal([1, 1, 1]);
    const B = matrix([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
    expect(A).toEqual(B);
  });
  it("should return true for equal matrices", () => {
    const A = matrix([
      [7, 2, 3],
      [5, 8, 3],
      [4, 2, 9],
    ]);
    const B = matrix([
      [7, 2, 3],
      [5, 8, 3],
      [4, 2, 9],
    ]);
    const res = A.equals(B);
    expect(res).toEqual(true);
  });
  it("should return false for non-equal matrices", () => {
    const A = matrix([
      [7, 2, 3],
      [5, 8, 3],
      [4, 2, 9],
    ]);
    const B = matrix([
      [7, 2, 3],
      [5, 8, 0],
      [4, 2, 9],
    ]);
    const res = A.equals(B);
    expect(res).toEqual(false);
  });
  it("should negate the given matrix", () => {
    const A = matrix([
      [-7, -2, 3],
      [5, 8, -3],
      [4, 2, -9],
    ]).neg();
    const B = matrix([
      [7, 2, -3],
      [-5, -8, 3],
      [-4, -2, 9],
    ]);
    expect(A).toEqual(B);
  });
  it("should return the matrix product", () => {
    const A = matrix([
      [2, 18, 1],
      [4, 12, 1],
    ]);
    const B = matrix([
      [16.5, 14.75],
      [0.55, 0.70],
      [5.95, 6.50],
    ]);
    const C = A.mul(B);
    const D = matrix([
      [48.85, 48.60],
      [78.55, 73.90],
    ]);
    expect(C).toEqual(D);
  });
  it("should transpose the matrix", () => {
    const A = matrix([
			[2,1,4],
			[0,3,1],
    ]).transpose();
    const B = matrix([
			[2,0],
			[1,3],
			[4,1],
    ]);
    expect(A).toEqual(B);
  });
});
