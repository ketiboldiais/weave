import {describe, expect, it} from 'vitest'
import { graph, vertex } from '../src'


describe('graph', () => {
	it('should record the added vertices', () => {
		const a = vertex(1);
		const b = vertex(2);
		const g = graph({}).vertex(a).vertex(b);
		const result = g.VertexSet;
		const expected = {1: a, 2: b};
		expect(result).toEqual(expected);
	})
})