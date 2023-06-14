import {describe, expect, it} from 'vitest'
import {vector} from '../src/index.js'

describe('vector', () => {
	it('should add two vectors', () => {
		const a = vector([1,2]);
		const b = vector([3,4]);
		const c = a.add(b);
		const expected = vector([4,6]);
		expect(c).toEqual(expected);
	})
	it('should compute the magnitude of two vectors', () => {
		const a = vector([2,5]);
		const b = a.magnitude();
		expect(b).toEqual(Math.sqrt(29))
	})
})