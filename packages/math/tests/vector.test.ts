import { vector, Vector, equalen } from "../src/algebra.js";
import { describe, expect, test } from "vitest";

describe('vector', () => {
	// it('foo', () => {
		// expect(1+1).eq(2)
	// })
	test('equalizer-1', () => {
		const a = vector([1,2,3]);
		const b = vector([3,4,5,6]);
		const [c,d] = equalen(a,b);
		expect(c.length).toBe(d.length);
	})

	test('sum-1', () => {
		const a = vector([1,2,3,4]);
		const b = vector([1,2,3,4]);
		const c = a.add(b);
		const d = vector([2,4,6,8]);
		expect(c).toEqual(d);
	})

	test('diff-1', () => {
		const a = vector([4,5,2]);
		const b = vector([1,2,3,4]);
		const c = a.sub(b);
		const d = vector([3,3,-1,-4]);
		expect(c).toEqual(d);
	})
	
	
	test('mag', () => {
		const a = vector([5,-4,7]);
		const c = a.mag();
		expect(c).toEqual(3 * Math.sqrt(10));
	})
	
	
	test('set', () => {
		const a = vector([5,-4,7]);
		const c = a.set(1,9);
		const e = vector([9,-4,7]);
		expect(c).toEqual(e);
	})
	
	
	test('set with index out of bounds', () => {
		const a = vector([5,-4]);
		const c = a.set(3,7);
		const e = vector([5,-4,7]);
		expect(c).toEqual(e);
	})

})
