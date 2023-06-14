import { typed } from "../typed.js";
import { Space } from "../space.js";
import { FigNode } from "../node.types.js";
import { unsafe, O, isnum, isstr } from "../aux.js";
import { vertex, Vertex } from './vertex.js';
import { edgekey, edge, Edge } from "./edge.js";

const GraphSpace = typed(Space);

export function isGraph(node: FigNode): node is Graph {
  return !unsafe(node) && node.isType("graph");
}

export function graph(data: {
  [key: string]: (string | number)[];
}) {
  const g = new Graph();
  Object.entries(data).forEach(([key, vals]) => {
    const source = vertex(key);
    vals.forEach((t) => {
      const target = vertex(t);
      g.edge(edge(source, target));
    });
  });
  return g;
}

export class Graph extends GraphSpace {
  alist: O<string, string[]> = {};
  nodeset: O<string, Vertex> = {};
  edgeset: Map<string, Edge> = new Map<string, Edge>();
  constructor() {
    super();
    this.type = "graph";
  }

  /**
   * Returns this graph’s edges.
   */
  edges() {
    const edges = Array.from(this.edgeset, ([_, e]) => e);
    return edges;
  }

  /**
   * Returns this graph’s vertices.
   */
  vertices() {
    const nodes = Object.values(this.nodeset);
    return nodes;
  }

  withoutNode(id: string) {
    const edgeIDs = new Set<string>();
    // prepare to delete from edgeset
    this.edgeset.forEach((e, k) => {
      if (e.source.id === id || e.target.id === id) {
        edgeIDs.add(k);
      }
    });
    // delete from alist
    for (const k in this.alist) {
      const neighbors = this.alist[k];
      this.alist[k] = neighbors.filter((v) => v !== id);
    }
    delete this.alist[id];
    // delete from nodeset
    if (this.nodeset[id]) {
      delete this.nodeset[id];
    }
    for (const k of edgeIDs) {
      this.edgeset.delete(k);
    }
    return this;
  }

  withoutEdge(sourceId: string, targetId: string) {
    // delete from alist
    if (this.alist[sourceId]) {
      this.alist[sourceId] = this.alist[sourceId].filter(
        (v) => v !== targetId
      );
    }

    // delete from edgeset
    const key = edgekey(sourceId, targetId);
    if (this.edgeset.has(key)) {
      this.edgeset.delete(key);
    }
  }

  hasNode(id: string) {
    return this.nodeset[id] !== undefined;
  }

  hasEdge(sourceId: string, targetId: string) {
    const id = `${sourceId}-${targetId}`;
    return this.edgeset.has(id);
  }

  link(a: string | number, b: string | number) {
    return this.edge(edge(vertex(a), vertex(b)));
  }

  /**
   * Includes the given edge in this graph.
   */
  edge(e: Edge) {
    let a = e.source;
    let b = e.target;
    if (this.hasNode(a.id)) {
      e.source = this.nodeset[a.id];
      this.alist[a.id].push(b.id);
    } else {
      this.nodeset[a.id] = a;
      this.alist[a.id] = [b.id];
    }
    if (this.hasNode(b.id)) {
      e.target = this.nodeset[b.id];
    } else {
      this.nodeset[b.id] = b;
      this.alist[b.id] = [];
    }
    this.node(e.source);
    this.node(e.target);
    this.edgeset.set(e.id, e);
    return this;
  }

  /**
   * Includes the given vertex in this
   * graph.
   */
  node(v: Vertex | string | number) {
    const node = isnum(v) || isstr(v) ? vertex(v) : v;
    const id = node.id;
    if (!this.hasNode(id)) {
      this.nodeset[id] = node;
      this.alist[id] = [];
    }
    return this;
  }
  /**
   * Adds multiple nodes to this graph.
   */
  nodes(vs: (Vertex | string | number)[]) {
    vs.forEach((v) => this.node(v));
    return this;
  }
}
