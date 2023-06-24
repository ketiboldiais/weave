import { clamp, unsafe } from "./aux.js";
import {
  Circle,
  circle,
  FigNode,
  Line,
  line,
  Space,
  Vector,
  vector,
} from "./index.js";
import { LinkedList, linkedList } from "./list.js";
import { typed } from "./typed.js";

class GNode<T = any> {
  id: string;
  tag: T | null = null;
  constructor(label: string) {
    this.id = label;
  }
  entag<K>(tag: K) {
    const out = new GNode<K>(this.id);
    out.tag = tag;
    return out;
  }
  tap<K>(f: (tag: T) => GNode<K>) {
    if (this.tag === null) return this as any as GNode<K>;
    const c = f(this.tag);
    const node = new GNode(this.id);
    node.tag = c;
    return node as GNode<K>;
  }
}

const vertex = (id: string | number) => new GNode(`${id}`);

class GEdge {
  source: GNode;
  target: GNode;
  id: string;
  constructor(source: GNode, target: GNode) {
    this.source = source;
    this.target = target;
    this.id = `${source.id}-${target.id}`;
  }
}

const edge = (source: GNode, target: GNode) => (
  new GEdge(source, target)
);

class Graph {
  nodeset: Record<string, GNode>;
  edges: GEdge[];
  nodes: GNode[];
  adjacency: Record<string, GNode[]>;
  constructor() {
    this.nodeset = {};
    this.edges = [];
    this.nodes = [];
    this.adjacency = {};
  }
  nodemap<tag>(callback: (node: GNode, index: number) => GNode<tag>) {
    return this.nodes.map(callback);
  }
  /**
   * Returns true if this graph
   * has the given node id.
   */
  hasNode(id: string) {
    return this.nodeset[id] !== undefined;
  }
  private newNode(value: string | number | GNode) {
    const v = (typeof value === "string" || typeof value === "number")
      ? vertex(value)
      : value;
    if (!this.hasNode(v.id)) {
      this.adjacency[v.id] = [];
      this.nodes.push(v);
    }
    this.nodeset[v.id] = v;
    return v;
  }
  /**
   * Adds a new node to this graph.
   */
  node(value: string | number | GNode) {
    this.newNode(value);
    return this;
  }
  /**
   * @internal Returns an (𝑆,𝑇) pair, where 𝑆 is the
   * source id, and 𝑇 is the target id.
   */
  private srctar(
    source: string | number | GNode,
    target: string | number | GNode,
  ) {
    const src = (typeof source === "string" || typeof source === "number")
      ? source
      : source.id;
    const tar = (typeof target === "string" || typeof target === "number")
      ? target
      : target.id;
    return [src, tar] as [string, string];
  }
  /**
   * Returns the index of the given source-target edge. If
   * no such edge exists, returns -1.
   */
  edgeIndex(source: string | number | GNode, target: string | number | GNode) {
    const id = this.srctar(source, target).join("-");
    return this.edges.findIndex((edge) => edge.id === id);
  }
  /**
   * @internal Adds a new edge to this graph.
   */
  private newEdge(
    source: string | number | GNode,
    target: string | number | GNode,
  ) {
    const src = this.newNode(source);
    const tar = this.newNode(target);
    const e = edge(src, tar);
    let hasEdge = false;
    for (let i = 0; i < this.adjacency[src.id].length; i++) {
      const neighbor = this.adjacency[src.id][i];
      const neighborID = neighbor.id;
      if (e.id === neighborID) hasEdge = true;
    }
    if (!hasEdge) {
      this.adjacency[src.id].push(tar);
    }
    const idx = this.edgeIndex(source, target);
    if (idx === -1) {
      this.edges.push(e);
    }
    return e;
  }
  /**
   * Adds a new edge to this graph.
   */
  edge(source: string | number | GNode, target: string | number | GNode) {
    this.newEdge(source, target);
    return this;
  }
  links(data: { [key: string | number]: (string | number)[] }) {
    Object.keys(data).forEach((sourceName) => {
      const source = vertex(sourceName);
      const neighbors = data[sourceName];
      neighbors.forEach((targetName) => {
        const target = vertex(targetName);
        this.newEdge(source, target);
      });
    });
    return this;
  }
  forEachNode(callback: (node: GNode, index: number) => void) {
    this.forEachNode(callback);
    return this;
  }
  path(source: GNode, target: GNode) {
    const frontier = linkedList<GNode<Tricolor>>();
    this.forEachNode((node) => {
      if (node.id === source.id) {
        frontier.push(node.entag<Tricolor>("grey"));
      } else frontier.push(node.entag<Tricolor>("white"));
    });
  }
  /**
   * Returns all edges whose source is
   * the provided source, and whose target
   * is the provided target.
   */
  incident(source: GNode | string | number) {
    const out: GEdge[] = [];
    const src = (typeof source === "string" || typeof source === "number")
      ? source
      : source.id;
    if (this.adjacency[src] === undefined) return out;
    const ids = new Set<string>();
    this.adjacency[src].forEach((neighbor) => {
      const tar = neighbor.id;
      const id = `${src}-${tar}`;
      ids.add(id);
    });
    this.edges.forEach((edge) => {
      if (ids.has(edge.id)) out.push(edge);
    });
    return out;
  }
}

type Tricolor = "white" | "grey" | "black";

/**
 * Creates a new graph data structure.
 * A data object may be passed, where each
 * key is a node name, followed by an array
 * of strings (the named node’s neighbors).
 */
export const graph = (
  data?: { [key: string | number]: (string | number)[] },
) => {
  const G = new Graph();
  if (data) {
    return G.links(data);
  }
  return G;
};

class Point {
  /** The point’s position. */
  p: Vector;
  /** The point’s mass. */
  m: number;
  /** The point’s velocity. */
  v: Vector = vector(0, 0);
  /** The point’s acceleration. */
  a: Vector = vector(0, 0);
  id: string;
  constructor(id: string, position: Vector, mass: number) {
    this.p = position;
    this.m = mass;
    this.id = id;
  }
  applyForce(force: Vector) {
    this.a = this.a.add(force.div(this.m));
    return this;
  }
}

const point = (id: string, position: Vector, mass: number) => (
  new Point(id, position, mass)
);

class Spring {
  /** The first endpoint of this spring. */
  point1: Point;
  /** The second endpoint  of this spring. */
  point2: Point;
  /** The length of the spring at rest. */
  length: number;
  /** The spring’s constant (see Hooke’s law). */
  k: number;
  id: string;
  constructor(point1: Point, point2: Point, length: number, k: number) {
    this.point1 = point1;
    this.point2 = point2;
    this.length = length;
    this.k = k;
    this.id = `${point1.id}-${point2.id}`;
  }
}
const spring = (
  point1: Point,
  point2: Point,
  length: number,
  stiffness: number,
) => (
  new Spring(point1, point2, length, stiffness)
);

const FORCE_GRAPH = typed(Space);

export class ForceGraph extends FORCE_GRAPH {
  graph: Graph;
  stiffness: number = 1;
  /**
   * Sets the default stiffness for springs
   * in this system.
   */
  k(value: number) {
    this.stiffness = value;
    return this;
  }
  repulsion: number = 2;
  damping: number = 0.01;
  minEnergyThreshold: number = 0.0001;
  maxSpeed: number = 100;
  nodePoints: { [key: string]: Point } = {};
  edgeSprings: { [key: string]: Spring } = {};
  iterations: number = 150;
  links: Line[] = [];
  nodes: Circle[] = [];
  constructor(graph: Graph) {
    super();
    this.graph = graph;
    this.type = "force-graph";
  }
  start() {
    if (this.graph === undefined) return this;
    let epsilon = 0;
    let t = 0;
    while (t < this.iterations) {
      t += 1;
      epsilon = this.tick(t);
      if (this.minEnergyThreshold <= epsilon) break;
    }
    this.forEachNode((node, point) => {
      const c = circle(5).xy(point.p.x, point.p.y).label(node.id);
      this.nodes.push(c);
    });
    this.forEachSpring((edge) => {
      const l = line(
        [edge.point1.p.x, edge.point1.p.y],
        [edge.point2.p.x, edge.point2.p.y],
      ).uid(edge.id);
      this.links.push(l);
    });
    return this;
  }
  tick(time: number) {
    this.applyCoulombsLaw();
    this.applyHookesLaw();
    this.attractToCenter();
    this.updateVelocity(time);
    this.updatePosition(time);
    return this.totalEnergy();
  }
  spring(edge: GEdge) {
    if (this.edgeSprings[edge.id] === undefined) {
      this.edgeSprings[edge.id] = spring(
        this.point(edge.source),
        this.point(edge.target),
        1,
        this.stiffness,
      );
    }
    return this.edgeSprings[edge.id];
  }
  private forEachNode(callback: (node: GNode, point: Point) => void) {
    this.graph.nodes.forEach((node) => {
      callback(node, this.point(node));
    });
  }
  private forEachSpring(callback: (spring: Spring) => void) {
    this.graph.edges.forEach((edge) => {
      callback(this.spring(edge));
    });
  }
  private point(node: GNode) {
    if (this.nodePoints[node.id] === undefined) {
      this.nodePoints[node.id] = point(node.id, Vector.random2D(150, 250), 1);
    }
    return this.nodePoints[node.id];
  }
  private fRepel(p1: Point, p2: Point) {
    const d = p1.p.sub(p2.p);
    const distance = d.mag() + 0.1;
    const direction = d.normalize();
    const euclidean_distance_squared = distance * distance;
    p1.applyForce(
      direction.mul(this.repulsion).div(
        euclidean_distance_squared * -0.5,
      ),
    );
    p2.applyForce(
      direction.mul(this.repulsion).div(
        euclidean_distance_squared * 0.5,
      ),
    );
  }

  private fSpring(spring: Spring) {
    const d = spring.point2.p.sub(spring.point1.p);
    const distance = d.mag();
    const direction = d.normalize();
    const log = Math.log10(distance / spring.length);
    const F1 = direction.mul(spring.k * -log);
    const F2 = direction.mul(spring.k * log);
    spring.point1.applyForce(F1);
    spring.point2.applyForce(F2);
  }
  private applyCoulombsLaw() {
    this.forEachNode((_, p1) => {
      this.forEachNode((_, p2) => {
        if (p1.id !== p2.id) {
          this.fRepel(p1, p2);
        }
      });
    });
  }

  private applyHookesLaw() {
    this.forEachSpring((spring) => {
      this.fSpring(spring);
    });
  }

  attractToCenter() {
    this.forEachNode((_, point) => {
      const direction = point.p.mul(-1);
      point.applyForce(direction.mul(this.repulsion));
    });
  }
  updateVelocity(time: number) {
    this.forEachNode((_, point) => {
      point.v = point.v.add(point.a.mul(time).mul(this.damping));
      if (point.v.mag() > this.maxSpeed) {
        point.v = point.v.normalize().mul(this.maxSpeed);
      }
      point.a = Vector.zero(2);
    });
  }
  updatePosition(time: number) {
    this.forEachNode((_, point) => {
      point.p = point.p.add(point.v.mul(time));
    });
  }
  totalEnergy() {
    let energy = 0;
    this.forEachNode((_, point) => {
      const speed = point.v.mag();
      energy += 0.5 * point.m * speed * speed;
    });
    return energy;
  }
}

export const eades = (graph: Graph) => new ForceGraph(graph);

export const isForceGraph = (node: FigNode): node is ForceGraph => (
  !unsafe(node) && node.isType("force-graph")
);

const d = graph({
  a: ["b"],
  b: ["c", "d"],
  c: ["a", "e", "d"],
  e: ["b", "a"],
  d: ["e"],
});
