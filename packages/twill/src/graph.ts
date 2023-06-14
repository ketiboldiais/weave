import { typed } from "./typed.js";
import { colorable } from "./colorable";
import { Text } from "./text.js";
import { Space } from "./space.js";
import { Line } from "./line.js";
import { FigNode } from "./node.types.js";
import {
	clamp,
  randFloat,
  randInt,
  tuple,
  unsafe,
} from "./aux.js";
import { Vector, vector } from "./vector.js";

const EDGE = typed(colorable(Line));
export class Edge extends EDGE {
  source: Vertex;
  target: Vertex;
  constructor(source: Vertex, target: Vertex) {
    super(source.cx, source.cy, target.cx, target.cy);
    this.type = "edge";
    this.source = source;
    this.target = target;
  }
  obj(): PlainEdge {
    const sourceID = this.source.content;
    const targetID = this.target.content;
    return { sourceID, targetID };
  }
  toString() {
    return `[${this.source.content}]-[${this.target.content}]`;
  }
}
export const edge = (source: Vertex, target: Vertex) => {
  return new Edge(source, target);
};

export const isEdge = (node: FigNode): node is Edge =>
  !unsafe(node) && node.isType("edge");

const VERTEX2D = typed(colorable(Text));

export class Vertex extends VERTEX2D {
  force: Vector;
  f: Vector;
  constructor(name: string) {
    super(name);
    this.type = "vertex";
    this.force = vector([0, 0]);
    this.f = vector([0, 0]);
    this.cx = this.force.x;
    this.cy = this.force.y;
  }
  enforce(x: number, y: number) {
    this.force.x = x;
    this.force.y = y;
    this.cx = this.force.x;
    this.cy = this.force.y;
  }
  obj(): PlainVertex {
    const ID = this.content;
    return { ID };
  }
}

export const vertex = (name: string | number): Vertex => {
  return new Vertex(`${name}`);
};

export const isVertex = (node: FigNode): node is Vertex =>
  !unsafe(node) && node.isType("vertex");

const GraphSpace = typed(Space);

type AdjacencyList = Map<string, PlainVertex[]>;
type VertexRecord = Map<string, Vertex>;
type EdgeRecord = Map<string, PlainEdge>;
type PlainEdge = { sourceID: string; targetID: string };
type PlainVertex = { ID: string };

class Eades {
  graph: Graph;
  spring_stiffness: number = 1;
  repulsion: number = 2;
  ideal_spring: number = 1;
  max_iterations: number = 20;
  nodes: Vertex[];
  edges: Edge[];
	epsilon:number=0.01;
  constructor(graph: Graph) {
    this.graph = graph;
    this.nodes = [];
    this.edges = [];
    const vertices: { [key: string]: Vertex } = {};
    this.graph.vertices.forEach((v, k) => {
      this.nodes.push(v);
      vertices[k] = v;
    });
    graph.edges.forEach((v) => {
      const { sourceID, targetID } = v;
      const source = vertices[sourceID];
      const target = vertices[targetID];
      if (source && target) {
        this.edges.push(edge(source, target));
      }
    });
  }
  fattract(u: Vertex, v: Vertex) {
    const fspring = this.fspring(u, v);
    const frep = this.frep(u, v);
    return fspring.minus(frep);
  }
  fspring(u: Vertex, v: Vertex) {
    const cspring = this.spring_stiffness;
    const ell = this.ideal_spring;
    const pv = v.force;
    const pu = u.force;
    const mag = pv.minus(pu).magnitude();
    const factor = Math.log10(mag / ell) * cspring;
    const unit = vector([v.force.x, v.force.y]).origin([
      u.force.x,
      u.force.y,
    ]);
    const out = unit.times(factor);
    return out;
  }
  frep(u: Vertex, v: Vertex) {
    const crep = this.repulsion;
    const pv = v.force;
    const pu = u.force;
    const mag = pv.minus(pu).magnitude() ** 2;
    const factor = crep / mag;
    const unit = vector([v.force.x, v.force.y]).origin([
      u.force.x,
      u.force.y,
    ]);
    const out = unit.times(factor);
    return out;
  }
  sumFattr(v: Vertex) {
    const es = this.edges.filter(
      (e) => e.source.content === v.content
    );
    const vs = es.map((e) => e.target);
    const sum = vs.reduce(
      (p, c) => p.add(this.fattract(c, v)),
      vector([0, 0])
    );
    return sum;
  }
  sumFrep(v: Vertex) {
    const s = this.edges.filter(
      (e) => e.source.content === v.content
    );
    const vs = s.map((e) => e.target);
    const sum = vs.reduce(
      (p, c) => p.add(this.frep(c, v)),
      vector([0,0])
    );
    return sum;
  }
  randomLayout() {
    const xmax = this.graph.xmax()-2;
    const xmin = this.graph.xmin()+2;
    const ymax = this.graph.ymax()-2;
    const ymin = this.graph.ymin()+2;
    this.nodes.forEach((v, k) => {
			v.enforce(randFloat(-3,3), randFloat(-3,3))
    });
  }

  draw() {
    this.randomLayout();
    let t = 1;
    const K = this.max_iterations;
		while (t < K) {
			this.nodes.forEach((u) => {
				const a = this.sumFrep(u);
				const b = this.sumFattr(u);
				const fu = a.add(b);
				u.f = fu;
			});
			this.nodes.forEach((u) => {
				const n = u.f.times(0.01);
				const f = u.force.add(n);
				const x = f.x;
				const y = f.y;
				u.enforce(x,y);
			})
			t = t + 1;
		}
    const nodes = this.nodes;
    const vertices: { [key: string]: Vertex } = {};
    this.graph.vertices.forEach((v, k) => {
      vertices[k] = v;
    });
		const edges:Edge[] = [];
    this.graph.edges.forEach((v) => {
      const { sourceID, targetID } = v;
      const source = vertices[sourceID];
      const target = vertices[targetID];
      if (source && target) {
        edges.push(edge(source, target));
      }
    });
    return { nodes, edges };
  }
}

export class Graph extends GraphSpace {
  graph: AdjacencyList = new Map<string, PlainVertex[]>();
  vertices: VertexRecord = new Map<string, Vertex>();
  edges: EdgeRecord = new Map<string, PlainEdge>();
  layout: "eades" = "eades";
  constructor() {
    super();
    this.type = "graph";
  }
  json(option: "vertices" | "edges") {
    if (option === "vertices") {
      const out: Record<string, PlainVertex> = {};
      this.vertices.forEach((v, k) => {
        out[k] = v.obj();
      });
      return out;
    }
    if (option === "edges") {
      const out: Record<string, PlainEdge> = {};
      this.edges.forEach((e, k) => {
        out[k] = e;
      });
      return out;
    }
  }
  vmap<K>(f: (s: Vertex) => K) {
    const out: K[] = [];
    this.vertices.forEach((v) => {
      out.push(f(v));
    });
    return out;
  }
  edgemap<K>(
    callback: (source: Vertex, target: Vertex) => K
  ) {
    const out: K[] = [];
    this.graph.forEach((vertices, key) => {
      const source = this.vertices.get(key);
      vertices.forEach((p) => {
        const target = this.vertices.get(p.ID);
        if (source && target) {
          out.push(callback(source, target));
        }
      });
    });
    return out;
  }
  vertexFold<K>(
    f: (accumulator: K, v: Vertex, index: number) => K,
    initialValue: K
  ) {
    let out = initialValue;
    let i = 0;
    this.vertices.forEach((v) => {
      out = f(out, v, i++);
    });
    return out;
  }
  has(v: Vertex) {
    return this.graph.has(v.content);
  }
  adjacent(v1: string, v2: string) {
    const key = `[${v1}]-[${v2}]`;
    return this.edges.has(key);
  }
  private pushEdge(edge: Edge) {
    const key = edge.toString();
    if (!this.edges.has(key)) {
      this.edges.set(key, edge.obj());
    }
  }
  private pushVertex(v1: Vertex, v2: Vertex) {
    let g = this.graph.get(v1.content);
    if (g) g.push(v2.obj());
  }
  private getVertex(node: Vertex | number | string) {
    return typeof node === "string" ||
      typeof node === "number"
      ? vertex(node)
      : node;
  }
  link(
    vertex1: Vertex | number | string,
    vertex2: Vertex | number | string
  ) {
    const v1 = this.getVertex(vertex1);
    const v2 = this.getVertex(vertex2);
    if (!this.has(v1)) {
      this.graph.set(v1.content, [v2.obj()]);
      this.vertices.set(v1.content, v1);
    } else this.pushVertex(v1, v2);
    if (!this.has(v2)) {
      this.graph.set(v2.content, [v1.obj()]);
      this.vertices.set(v2.content, v2);
    } else this.pushVertex(v2, v1);
    this.pushEdge(edge(v1, v2));
    this.pushEdge(edge(v2, v1));
  }
  vertex(node: Vertex | string | number) {
    const v = this.getVertex(node);
    if (!this.has(v)) {
      this.graph.set(v.content, []);
      this.vertices.set(v.content, v);
    }
    return this;
  }
	data: GraphData = {nodes:[], edges: []};
  figure(): Graph {
    if (this.layout === "eades") {
      const fig = new Eades(this);
      this.data = fig.draw();
    }
		return this;
  }
}
type GraphData = { nodes: Vertex[]; edges: Edge[] };
type RelationMap = { [key: string]: (string | number)[] };

export const graph = (data: RelationMap) => {
  const g = new Graph();
  const added = new Set<string | number>();
  Object.keys(data).forEach((k) => {
    added.add(k);
    g.vertex(k);
  });
  Object.entries(data).forEach(([a, vertices]) => {
    vertices.forEach((b) => {
      g.link(a, b);
    });
  });
  return g;
};

export const isGraph = (node: FigNode): node is Graph =>
  !unsafe(node) && node.isType("graph");



const g = graph({
  a: ["b", "d"],
  c: ["d", "i", "e"],
  j: ["c", "k", "o"],
});
