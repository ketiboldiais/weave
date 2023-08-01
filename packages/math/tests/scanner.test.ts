import { describe, expect, it } from "vitest";
import { Matrix, diagonal, matrix } from "../src/index.js";

describe("scanner", () => {
  it("should scan a number.", () => {
    const A = matrix([
      [1, 2, 3],
      [4, 5, 6],
      [5, 7, 8],
    ]);
    const B = A.copy();
    expect(A).toEqual(B);
  });
});
