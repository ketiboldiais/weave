import { isnum, isstr, safe } from './aux.js';

export class Vertex {
  key:string;
  constructor(key: string) {
    this.key=key;
  }
}

export const vertex = (key: string | number) => new Vertex(`${key}`);



type EdgeType = '->' | '--';

export class Edge {
  source: string;
  target: string;
  kind: EdgeType;
  key:string;
  constructor(source: string, target: string, kind: EdgeType = '--') {
    this.key=`${source}${kind}${target}`;
    this.source = source;
    this.target = target;
    this.kind = kind;
  }
  get rkey() {
    return `${this.target}${this.kind}${this.source}`;
  }
  clone() {
    const out = new Edge(this.source, this.target);
    out.kind = this.kind;
    return out;
  }
  rclone() {
    const out = this.clone();
    out.key = `${this.target}${this.kind}${this.source}`;
    out.source = this.target;
    out.target = this.source;
    return out;
  }

  isDirected() {
    return this.kind === '->';
  }
}
export const edge = (source: Vertex | number | string, target: Vertex | number | string) =>
  new Edge(
    isnum(source) || isstr(source) ? `${source}` : source.key,
    isnum(target) || isstr(target) ? `${target}` : target.key
  );

export class Graph {
  adjacency: Record<string, string[]>;
  edges: Record<string, Edge>;
  nodes: Record<string, Vertex>;
  constructor() {
    this.adjacency = {};
    this.edges = {};
    this.nodes = {};
  }
  node(key: string | number | Vertex) {
    const a = isnum(key) || isstr(key) ? vertex(key) : key;
    if (!this.hasNode(a.key)) {
      this.nodes[a.key] = a;
    }
    if (!this.adjacency[a.key]) {
      this.adjacency[a.key] = [];
    }
    return this;
  }
  hasNode(key: string) {
    return safe(this.nodes[key]);
  }
  hasLink(sourceKey: string, edgeType: EdgeType, targetKey: string) {
    const key = sourceKey + edgeType + targetKey;
    return safe(this.edges[key]);
  }
  hasEdge(edge: Edge) {
    return safe(this.edges[edge.key]);
  }
  link(source: string | number | Vertex, target: string | number | Vertex) {
    const a = isnum(source) || isstr(source) ? vertex(source) : source;
    this.node(a);
    const b = isnum(target) || isstr(target) ? vertex(target) : target;
    this.node(b);
    const e = edge(a, b);
    if (!this.hasEdge(e)) {
      this.edges[e.key] = e;
      this.adjacency[a.key].push(b.key);
      if (!e.isDirected()) {
        const e2 = e.rclone();
        this.edges[e2.key] = e2;
				this.adjacency[b.key].push(a.key);
      }
    }
    return this;
  }
}
export const graph = () => {
  return new Graph();
};




