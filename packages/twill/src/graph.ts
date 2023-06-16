import { textual } from './textual.js';
import { Vector, vector } from './vector.js';
import { typed } from './typed.js';
import { Datum } from './base.js';
import { clamp, isnum, isstr, randInt, safe, unsafe } from './aux.js';
import { Space } from './space.js';
import { FigNode } from './node.types.js';
import { colorable } from './colorable.js';

export class Vertex {
  key: string;
  constructor(name: string) {
    this.key = name;
  }
  /**
   * Returns this vertex as a plain
   * object, shaped:
   *
   * ~~~ts
   * {vertex: string}
   * ~~~
   */
  json() {
    const vertex = this.key;
    return { vertex };
  }
  /**
   * Returns a string form of this
   * vertex. The string has the form:
   * ```
   * (k)
   * ```
   * where k is the vertex’s key.
   */
  toString() {
    return `(${this.key})`;
  }
  /**
   * Sets this vertex’s key. To maintain transparency,
   * the vertex’s key is its text content (i.e., label)
   * by default. Thus, vertices with the same text
   * content are treated as the same vertices. In short,
   * what you see is what you get.
   *
   * The vertex key is used by the {@link Graph}
   * module to distinguish between vertices.
   * If this value is changed, the graph module
   * will distinguish this vertex from vertices
   * with the same label. Thus, to ensure two
   * vertices with the same label are treated
   * differently, call this method with a value
   * other than the text content.
   */
  tag(value: string | number) {
    this.key = `${value}`;
    return this;
  }

  /**
   * Returns a simple edge between this vertex and the supplied
   * vertex.
   */
  link(otherVertex: string | number | Vertex) {
    return edge(this, otherVertex, '--');
  }

  /**
   * Returns a directed link from this vertex to the supplied
   * vertex.
   */
  to(otherVertex: string | number | Vertex) {
    return edge(this, otherVertex, '->');
  }

  /**
   * Returns a directed link from the supplied vertex
   * to this vertex.
   */
  from(otherVertex: string | number | Vertex) {
    return edge(otherVertex, this, '->');
  }

  /**
   * Returns a parellel edge between this
   * vertex and the other.
   */
  parallel(otherVertex: string | number | Vertex) {
    return edge(this, otherVertex, '<=>');
  }
}

/**
 * Creates a new {@link Graph} vertex.
 */
export const vertex = (name: string | number) => {
  return new Vertex(`${name}`);
};

type LinkDirection = '->' | '--' | '<=>';

const edgeKey = (source: string | number, target: string | number, direction: LinkDirection) => {
  return `${source}${direction}${target}`;
};

export class Edge {
  /**
   * The source vertex of this edge.
   */
  source: Vertex;
  /**
   * The target vertex of this edge.
   */
  target: Vertex;

  direction: LinkDirection;

  weight: number = 0;

  weighed(value: number) {
    this.weight = value;
    return this;
  }

  ofType(option: LinkDirection) {
    this.direction = option;
    return this;
  }

  constructor(source: Vertex, target: Vertex, direction: LinkDirection) {
    this.source = source;
    this.target = target;
    this.direction = direction;
  }

  isSimple() {
    return this.direction === '--';
  }

  isParallel() {
    return this.direction === '<=>';
  }

  isDirected() {
    return this.direction === '->';
  }

  /**
   * Returns this edge as a plain
   * object, shaped:
   *
   * ~~~ts
   * {source:string, target:string}
   * ~~~
   */
  json() {
    const source = this.source.key;
    const target = this.target.key;
    return { source, target };
  }
  get key() {
    return edgeKey(this.source.key, this.target.key, this.direction);
  }
}

/**
 * Creates a new {@link Graph} edge.
 */
export const edge = (
  source: Vertex | string | number,
  target: Vertex | string | number,
  direction: LinkDirection = '--'
) => {
  const a = isnum(source) || isstr(source) ? vertex(source) : source;
  const b = isnum(target) || isstr(target) ? vertex(target) : target;
  return new Edge(a, b, direction);
};
const cloneEdge = (link: Edge) => {
  const out = edge(link.source, link.target, link.direction).weighed(link.weight);
  return out;
};

export class Graph {
  VertexSet: Record<string, Vertex>;
  EdgeSet: Record<string, Edge>;
  Adjacency: Record<string, string[]>;
  vertexCount: number = 0;
  constructor() {
    this.VertexSet = {};
    this.EdgeSet = {};
    this.Adjacency = {};
  }

  /**
   * Returns an array of all edge keys non-incident
   * to the given vertex.
   */
  nonIncident(vertex: string | number | Vertex) {
    const incidents = new Set(this.incident(vertex));
    const out: string[] = [];
    Object.keys(this.EdgeSet).forEach((edgeKey) => {
      if (!incidents.has(edgeKey)) {
        out.push(edgeKey);
      }
    });
    return out;
  }

  /**
   * Returns an array of all edge keys incident
   * to the given vertex.
   */
  incident(vertex: string | number | Vertex) {
    const source = isnum(vertex) || isstr(vertex) ? vertex : vertex.key;
    const edgeKeys: string[] = [];
    this.adjacent(source).forEach((target) => {
      const st = edgeKey(source, target, '->');
      if (this.EdgeSet[st]) edgeKeys.push(st);
      const ts = edgeKey(target, source, '->');
      if (this.EdgeSet[ts]) edgeKeys.push(ts);
      const l1 = edgeKey(source, target, '--');
      if (this.EdgeSet[l1]) edgeKeys.push(l1);
      const l2 = edgeKey(target, source, '--');
      if (this.EdgeSet[l2]) edgeKeys.push(l2);
    });
    return edgeKeys;
  }
  /**
   * Returns an array of all vertex keys
   * non-adjacent to the supplied vertex (or vertex key).
   */
  apart(vertex: string | number | Vertex) {
    const key = isnum(vertex) || isstr(vertex) ? vertex : vertex.key;
    const adjacent = new Set(this.Adjacency[key]);
    const out: string[] = [];
    Object.keys(this.Adjacency).forEach((vertexKey) => {
      if (!adjacent.has(vertexKey) && key !== vertexKey) {
        out.push(vertexKey);
      }
    });
    return out;
  }

  /**
   * Returns an array of all vertex keys
   * adjacent to the supplied vertex (or vertex key).
   */
  adjacent(vertex: string | number | Vertex) {
    const key = isnum(vertex) || isstr(vertex) ? vertex : vertex.key;
    const out = this.Adjacency[key];
    if (out) return out;
    else return [];
  }
  /**
   * Returns an array of all the vertices
   * in this graph.
   */
  vertexList() {}

  /**
   * Returns an array of all the
   * edges in this graph.
   */
  edgeList() {}

  /**
   * Returns true if the provided link (a pair of
   * `source.key` and `target.key`) exists within
   * this graph. Note that this will only test
   * for `source~target`.
   *
   * @param direction One of:
   * 1. `->` - Returns true only if the edge `source->target` exists.
   * 2. `<-` - Returns true only if the edge `target->source` exists.
   * 3. `<-||->` - Returns true if the edge `source->target` exists, OR
   *    if the edge `target->source` exists.
   * 3. `<-&->` - Returns true only if both edges `source->target`
   *     AND `target->source` exist.
   * 4. `<=>` Returns true only if the parellel edge `source<=>target` exists.
   * 4. `--` - Returns true if the simple edge `source--target` exists.
   * 6. `~~` Returns true if either `source--target` exists or if `target--source` exists.
   */
  hasLink(
    direction: '->' | '<-' | '<-||->' | '<-&->' | '<=>' | '--' | '~~',
    sourceKey: string | number,
    targetKey: string | number
  ): boolean {
    if (
      direction === '->' ||
      direction === '<-' ||
      direction === '<-&->' ||
      direction === '<-||->' ||
      direction === '<=>'
    ) {
      const source_to_target = edgeKey(sourceKey, targetKey, '->');
      const target_to_source = edgeKey(targetKey, sourceKey, '->');
      switch (direction) {
        case '->': {
          return safe(this.EdgeSet[source_to_target]);
        }
        case '<-': {
          return safe(this.EdgeSet[target_to_source]);
        }
        case '<-&->': {
          return safe(this.EdgeSet[source_to_target]) && safe(this.EdgeSet[target_to_source]);
        }
        case '<-||->': {
          return safe(this.EdgeSet[source_to_target]) || safe(this.EdgeSet[target_to_source]);
        }
        case '<=>': {
          const pk1 = edgeKey(sourceKey, targetKey, '->');
          const pk2 = edgeKey(targetKey, sourceKey, '->');
          return safe(this.EdgeSet[pk1] && this.EdgeSet[pk2]);
        }
        default:
          return false;
      }
    } else if (direction === '--' || direction === '~~') {
      const st = edgeKey(sourceKey, targetKey, '--');
      const ts = edgeKey(targetKey, sourceKey, '--');
      switch (direction) {
        case '~~':
          return safe(this.EdgeSet[st]) || safe(this.EdgeSet[ts]);
        case '--':
          return safe(this.EdgeSet[st]);
        default:
          return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Returns true if this graph contains
   * the provided vertex key.
   */
  hasVertex(vertexKey: string | number | Vertex) {
    const key: string = isnum(vertexKey) || isstr(vertexKey) ? `${vertexKey}` : vertexKey.key;
    return safe(this.Adjacency[key]);
  }

  /**
   * @internal
   * Returns true if this graph’s vertex set
   * contains the provided vertex or vertex key.
   */
  private vertexSetHas(vertexKey: string | number | Vertex) {
    const key: string = isnum(vertexKey) || isstr(vertexKey) ? `${vertexKey}` : vertexKey.key;
    return safe(this.VertexSet[key]);
  }

  /**
   * Adds a new vertex to this graph
   * if the vertex doesn’t already exist.
   */
  vertex(entry: Vertex | string | number) {
    const vtx: Vertex = isnum(entry) || isstr(entry) ? vertex(entry) : entry;

    // CASE: adjacency list doesn’t have the vertex
    //   if the adjacency list doesn’t have the vertex,
    //   initiate a new key with an empty string array
    if (!this.hasVertex(vtx)) {
      this.Adjacency[vtx.key] = [];
    }
    // CASE: adjacency list has the vertex
    //   do nothing - the adjacency list only maps keys to their neighbors

    // CASE: vertex set doesn’t have the vertex
    //   add vertex to the vertex to the vertex set
    if (!this.vertexSetHas(vtx)) {
      this.VertexSet[vtx.key] = vtx;
    }

    // CASE: vertex set has the vertex
    //  do nothing - we already have the key recorded.
    return this;
  }

  /**
   * Adds the provided edge to this graph if
   * the edge doesn’t already exist.
   */
  edge(edge: Edge) {
    const source = edge.source;
    // save the source vertex if necessary.
    this.vertex(source);

    const target = edge.target;

    // save the target vertex if necessary.
    this.vertex(target);

    const s = source.key;
    const t = target.key;

    // handle case where edge is simple
    if (edge.isSimple()) {
      // edge key could be s--t or t--s
      if (!this.hasLink('--', s, t)) {
        this.EdgeSet[edgeKey(s, t, '--')] = edge;
        this.Adjacency[s].push(t);
      }
      if (!this.hasLink('--', t, s)) {
        this.EdgeSet[edgeKey(t, s, '--')] = edge;
        this.Adjacency[t].push(s);
      }
    }

    // handle case where edge is directed
    if (edge.isDirected()) {
      if (!this.EdgeSet[edge.key]) {
        this.EdgeSet[edge.key] = edge;
        this.Adjacency[s].push(t);
      }
    }

    // handle case where edge is parallel
    if (edge.isParallel()) {
      if (!this.hasLink('<=>', s, t)) {
        const stEdge = cloneEdge(edge).ofType('->');
        this.EdgeSet[stEdge.key] = stEdge;
        const tsEdge = cloneEdge(edge).ofType('->');
        tsEdge.source = edge.target;
        tsEdge.target = edge.source;
        this.EdgeSet[tsEdge.key] = tsEdge;
        this.Adjacency[s].push(t);
        this.Adjacency[t].push(s);
      }
    }

    return this;
  }

  /**
   * Adds the source-target argument pair
   * as a new edge to this graph, if the
   * graph doesn’t already contain the edge.
   */
  link(
    source: Vertex | string | number,
    target: Vertex | string | number,
    type: LinkDirection = '--'
  ) {
    const E = edge(source, target, type);
    return this.edge(E);
  }
}

export type AdjacencyList = {
  [key: string]: (string | number | Vertex)[];
};

/**
 * Returns a new {@link Graph}. The function
 * takes either:
 *
 * 1. An array of {@link Edge|edges}, or
 * 2. An {@link AdjacencyList}. An adjacency
 *    list is defined as an object with the signature:
 *
 * ~~~ts
 * { [key:string]: (string|number|Vertex)[] }
 * ~~~
 */
export function graph(
  ...links: ([string | number, LinkDirection, string | number] | Edge)[]
): Graph {
  const _graph = new Graph();
  links.forEach((entry) => {
    if (Array.isArray(entry)) {
      const [a, direction, b] = entry;
      _graph.edge(edge(a, b, direction));
    } else {
      _graph.edge(entry);
    }
  });
  return _graph;
}

const FORCEGRAPH = typed(Space);

const PARTICLE = typed(Datum);
const SPRING = typed(Datum);

export class Spring extends SPRING {
  source: Particle;
  target: Particle;
  length: number = 0;
  k: number = 0.05;
  constructor(source: Particle, target: Particle) {
    super('');
    this.type = 'force-spring';
    this.source = source;
    this.target = target;
  }
}

export const spring = (p1: Particle, p2: Particle) => {
  return new Spring(p1, p2);
};

export class Particle extends PARTICLE {
  position: Vector;
  r: number = 5;
  mass: number = (2 * Math.PI * 1.1) / 1.5;
  velocity: Vector;
  acceleration: Vector;
  constructor(key: string) {
    super(key);
    this.label = key;
    this.position = vector([0, 0]);
    this.velocity = vector([0, 0]);
    this.acceleration = vector([0, 0]);
    this.type = 'particle';
  }
  place(v: Vector) {
    this.position = v;
    return this;
  }
  applyForce(force: Vector) {
    this.acceleration = this.acceleration.add(force.div(this.mass));
    return this;
  }
}

export const particle = (vertex: Vertex | string | number) => {
  const key = isnum(vertex) || isstr(vertex) ? `${vertex}` : vertex.key;
  return new Particle(key);
};

export class SpringGraph extends FORCEGRAPH {
  graph: Graph;
  nodes: Record<string, Particle>;
  edges: Spring[];
  epsilon: number = 0.000004;
  maxIterations: number = 200;

  constructor(graph: Graph) {
    super();
    this.type = 'force-spring-graph';
    this.graph = graph;
    this.nodes = {};
    this.edges = [];
  }
  forEachSpring(callback: (spring: Spring) => void) {
    this.edges.forEach((spring) => callback(spring));
  }
  forEachNode(callback: (particle: Particle) => void) {
    for (const k in this.nodes) {
      const particle = this.nodes[k];
      callback(particle);
    }
  }
  C_spring: number = 1;

  /**
   * Sum of attractive force to
   * all adjacent vertices.
   */
  attract() {
    this.forEachSpring((spring) => {
      const d = spring.target.position.minus(spring.source.position);
      const displacement = d.magnitude() - 10;
      const direction = d.normalize();
      this.nodes[spring.source.label].applyForce(direction.times(spring.k * displacement * .5))
      this.nodes[spring.target.label].applyForce(direction.times(spring.k * displacement * -.5))
    });
  }
  spring_rest_length:number=10;
  charge:number=150*150;
  damping:number=0.15;
  maxspeed:number=0.01;
  updateVelocity(t:number) {
    this.forEachNode((node)=>{
      node.velocity = node.velocity.add(node.acceleration.times(t)).times(this.damping)
      if (node.velocity.magnitude() > this.maxspeed) {
        node.velocity = node.velocity.normalize().times(this.maxspeed);
      }
      node.acceleration = vector([0,0]);
    })
  }
  totalEnergy() {
    let energy = 0;
    this.forEachNode((node)=>{
      let speed = node.velocity.magnitude();
      energy += 0.5 * node.mass * speed * speed;
    })
    return energy;
  }
  Distance(p1:Particle, p2:Particle) {
    const dx = p1.position.x - p2.position.x;
    const dy = p1.position.y - p2.position.y;
    return Math.sqrt(dx*dx + dy*dy);
  }

  updatePosition(t:number) {
    this.forEachNode((node)=>{
      node.position = node.position.add(node.velocity.times(0.5))
    })
  }
  toCenter() {
    this.forEachNode((node) => {
      const G = node.position.times(-1);
      node.applyForce(G);
    });
  }

  C_repulsion: number = 1;
  /**
   * Sum of repulsive force to every
   * other vertex.
   */
  repel() {
    this.forEachNode((p1) => {
      this.forEachNode((p2) => {
        if (p1.label !== p2.label) {
          const d = p1.position.minus(p2.position);
          const distance = d.magnitude() + 0.1;
          const direction = d.normalize();
          p1.applyForce(direction.times(this.C_repulsion).div(distance * distance));
          p2.applyForce(direction.times(this.C_repulsion).div(distance * distance));
        }
      });
    });
  }

  tick(timestep: number) {
    this.repel();
    this.attract();
    this.updateVelocity(timestep);
    this.updatePosition(timestep);
  }

  init() {
    const width = this.boxed('width');
    const height = this.boxed('height');
    for (const v in this.graph.VertexSet) {
      const vertex = this.graph.VertexSet[v];
      const x = width/2 + (100*Math.random());
      const y = height/2 + (100*Math.random());
      const p = particle(vertex);
      p.place(vector([x,y]));
      this.nodes[p.label] = p;
    }
    const edgeSet = new Set<string>();
    for (const key in this.graph.EdgeSet) {
      const edge = this.graph.EdgeSet[key];
      const sourceKey = edge.source.key;
      const targetKey = edge.target.key;
      const source = this.nodes[sourceKey];
      const target = this.nodes[targetKey];
      const link = spring(source, target);
      if (edge.isSimple()) {
        const k1 = edgeKey(sourceKey, targetKey, '--');
        const k2 = edgeKey(targetKey, sourceKey, '--');
        if (!edgeSet.has(k1) && !edgeSet.has(k2)) {
          this.edges.push(link);
          edgeSet.add(k1).add(k2);
        }
      } else {
        this.edges.push(link);
      }
    }
  }
  figure() {
    this.init();
    this.toCenter();
    let t = 0;
    // let K = this.maxIterations;
    let K = 500;
    let max = 100;
    while (t < K && max > this.epsilon) {
      this.tick(0.005);
      max=this.totalEnergy();
      t+=1;
    }
    return this;
  }
}

export const forceSpring = (graph: Graph) => new SpringGraph(graph);
export const isSpringGraph = (node: FigNode): node is SpringGraph =>
  !unsafe(node) && node.isType('force-spring-graph');
