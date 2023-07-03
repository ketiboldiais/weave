import {describe, expect, it} from 'vitest'
import { graph, vertex } from '../src'


describe('graph', () => {
	it('should save the vertices', () => {
		const g = graph().node(1).node(2);
		const adjacency = g.adjacency;
		const exp = {1: [], 2: []}
		expect(adjacency).toEqual(exp);
	})
	it('should record the added vertices', () => {
		const a1 = vertex(1);
		const a2 = vertex(2);
		const g = graph().node(a1).node(a2);
		const adjacency = g.nodes;
		const exp = {1: a1, 2: a2}
		expect(adjacency).toEqual(exp);
	})
	it('should record the links', () => {
		const a1 = vertex(1);
		const a2 = vertex(2);
		const g = graph().link(a1, a2);
		const nodes = g.nodes;
		const exp = {1: a1, 2: a2}
		expect(nodes).toEqual(exp);
	})
	it('should save the link nodes to the adjacency list', () => {
		const a1 = vertex(1);
		const a2 = vertex(2);
		const g = graph().link(a1, a2);
		const nodes = g.adjacency;
		const exp = {1: [a2.key], 2: [a1.key]}
		expect(nodes).toEqual(exp);
	})
	it('should NOT save the link nodes to the adjacency list', () => {
		const a1 = vertex(1);
		const a2 = vertex(2);
		const g = graph().link(a1, a2).link(a1,a2);
		const nodes = g.adjacency;
		const exp = {1: [a2.key], 2: [a1.key]}
		expect(nodes).toEqual(exp);
	})
})