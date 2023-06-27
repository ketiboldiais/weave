import { tuple } from "../aux";
import { Edge, edge } from "./edge";
import { Vertex, vtx } from "./vertex";

export class Graph<T=any,K=any> {
  adjacency: Map<string | number, Vertex<T>[]>;
  vertices: Map<string | number, Vertex<T>>;
  edges: Map<string, Edge<T, K>>;
  constructor() {
    this.adjacency = new Map();
    this.vertices = new Map();
    this.edges = new Map();
  }
  neighbors(vertex:Vertex) {
    const out:Vertex[] = [];
    this.edges.forEach(e => {
      if (e.source.id===vertex.id) out.push(e.target);
      else if (e.target.id===vertex.id) out.push(e.source);
    })
    return out;
  }
  
  edgeList() {
    const out: Edge[] = [];
    this.edges.forEach((e) => {
      out.push(e);
    });
    return out;
  }
  vertexList() {
    const out: Vertex[] = [];
    this.vertices.forEach((v) => {
      out.push(v);
    });
    return out;
  }
  hasV(vertexID: string | number) {
    return this.adjacency.has(vertexID);
  }
  vertex<T>(value: string | number | Vertex, data: T | null = null) {
    const v = typeof value === "string" || typeof value === "number"
      ? vtx(value, data)
      : value;
    if (!this.hasV(v.id)) {
      this.adjacency.set(v.id, []);
    }
    this.vertices.set(v.id, v);
    return v;
  }
  E(edge: Edge) {
    const source = this.vertex(edge.source);
    const target = this.vertex(edge.target);
    this.adjacency.get(source.id)!.push(this.vertices.get(target.id)!);
    this.adjacency.get(target.id)!.push(this.vertices.get(source.id)!);
    this.edges.set(edge.id, edge);
    const rev = edge.reverse();
    this.edges.set(rev.id, rev);
    return this;
  }
  edge(sourceID: string | number | Vertex, targetID: string | number | Vertex) {
    const E = edge(sourceID, targetID);
    this.E(E);
    return this;
  }
  obj() {
    const out: { V: any; E: any } = {
      V: {},
      E: {},
    };
    this.adjacency.forEach((v, k) => {
      out.V[k] = v.map((v) => v.obj());
    });
    this.edges.forEach((e, k) => {
      out.E[k] = e.obj();
    });
    return out;
  }
}

export const graph = (adjacencyList?: Record<string, (string | number)[]>) => {
  const G = new Graph();
  if (adjacencyList) {
    Object.keys(adjacencyList).forEach((source) => {
      const targets = adjacencyList[source];
      const src = vtx(source);
      targets.forEach((target) => {
        const tar = vtx(target);
        const e = edge(src, tar);
        G.E(e);
      });
    });
  }
  return G;
};
