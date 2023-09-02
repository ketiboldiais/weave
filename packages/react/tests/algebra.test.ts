import { expect, it } from "vitest";
import { frac, int, simplifyRationalNumber } from "../src/loom";

it("should simplify a rational", () => {
  const x = frac(2, 4);
  const y = simplifyRationalNumber(x);
  const e = frac(1, 2);
  expect(y).toEqual(e);
});
