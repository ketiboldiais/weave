import { expect, it } from "vitest";
import { frac, evaluateQuotient, Undefined, evaluateSum, evaluateDiff } from "../src/loom"

it('should simplify a quotient', () => {
	const a = frac(2,3);
	const b = frac(1,3);
	const r = evaluateQuotient(a,b);
	const e = frac(6,3); // 2/3 * 3/1 = 6/3
	expect(r).toEqual(e);
})

it('should simplify a negative quotient', () => {
	const a = frac(-1,2);
	const b = frac(1,2);
	const r = evaluateQuotient(a,b);
	const e = frac(-2,2); // -1/2 * 2/1 = -2/2
	expect(r).toEqual(e);
})


it('should simplify an undefined quotient', () => {
	const a = frac(-1,2);
	const b = frac(0,2);
	const r = evaluateQuotient(a,b);
	const e = Undefined(''); // -1/2 * 2/1 = -2/2
	expect(r).toEqual(e);
})


it('should simplify a sum', () => {
	const a = frac(1,2);
	const b = frac(1,2);
	const r = evaluateSum(a,b);
	const e = frac(4,4); // 1/2 + 1/2 = 4/4
	expect(r).toEqual(e);
})


it('should simplify a difference', () => {
	const a = frac(2,3);
	const b = frac(1,3);
	const r = evaluateDiff(a,b);
	const e = frac(3,9); // 2/3 - 1/3 = ((2*3) - (1*3)) / 9 = (3/9)
	expect(r).toEqual(e);
})