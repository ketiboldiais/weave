import {describe, expect, it} from 'vitest'
import {vector} from '../src/index.js'

describe('vector', () => {
	it('should add two vectors immutably', () => {
		const a = vector(1,2,3);
		const b = vector(3,4,5);
		const result = a.add(b);
		const sum = vector(4,6,8);
		expect(result).toEqual(sum);
	})
	it('should add the two vectors without mutating the original vector', () => {
		const a = vector(1,2,3);
		const b = vector(3,4,5);
		const result = a.add(b);
		const sum = vector(4,6,8);
		expect(a).toEqual(a);
	})
	it('should add the two vectors without mutating the argument', () => {
		const a = vector(1,2,3);
		const b = vector(3,4,5);
		const result = a.add(b);
		const sum = vector(4,6,8);
		expect(b).toEqual(b);
	})
	it('should add two vectors mutably', () => {
		const a = vector(1,2,3);
		const b = vector(3,4,5);
		a.ADD(b);
		const sum = vector(4,6,8);
		expect(a).toEqual(sum);
	})
	


	
	it('should subtract two vectors immutably', () => {
		const a = vector(4,5,6);
		const b = vector(1,2,3);
		const result = a.sub(b);
		const sum = vector(3,3,3);
		expect(result).toEqual(sum);
	})
	it('should add the two vectors without mutating the original vector', () => {
		const a = vector(4,5,6);
		const b = vector(1,2,3);
		const result = a.sub(b);
		const sum = vector(3,3,3);
		expect(a).toEqual(a);
	})
	it('should add the two vectors without mutating the argument', () => {
		const a = vector(4,5,6);
		const b = vector(1,2,3);
		const result = a.sub(b);
		const sum = vector(3,3,3);
		expect(b).toEqual(b);
	})
	it('should add two vectors mutably', () => {
		const a = vector(4,5,6);
		const b = vector(1,2,3);
		a.SUB(b);
		const sum = vector(3,3,3);
		expect(a).toEqual(sum);
	})

	it('should return the distance between the two vectors', () => {
		const a = vector(5,0);
		const b = vector(-1,8);
		const distance = a.distance(b);
		const exp = 10;
		expect(distance).toEqual(exp);
	})

	it('should return the dot product of the two vectors', () => {
		const a = vector(3,-2,7);
		const b = vector(0,4,-1);
		const dot = a.dot(b);
		const exp = -15;
		expect(dot).toEqual(exp);
	})
})