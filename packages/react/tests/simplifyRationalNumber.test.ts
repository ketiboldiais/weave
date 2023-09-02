import { expect, it } from "vitest";
import { frac, int, simplifyRationalNumber } from "../src/loom";

it("should simplify a rational", () => {
  const x = frac(2, 4);
  const y = simplifyRationalNumber(x);
  const e = frac(1, 2);
  expect(y).toEqual(e);
});

it("should simplify an int to an int", () => {
  const x = int(2)
  const y = simplifyRationalNumber(x);
  const e = int(2);
  expect(y).toEqual(e);
});

it("should simplify a negative/positive rational", () => {
  const x = frac(-4,2);
  const y = simplifyRationalNumber(x);
  const e = int(-2);
  expect(y).toEqual(e);
});


it("should simplify a negative/negative rational", () => {
  const x = frac(-4,-2);
  const y = simplifyRationalNumber(x);
  const e = int(2);
  expect(y).toEqual(e);
});


it("should simplify a positive/negative rational", () => {
  const x = frac(4,-2);
  const y = simplifyRationalNumber(x);
  const e = int(-2);
  expect(y).toEqual(e);
});