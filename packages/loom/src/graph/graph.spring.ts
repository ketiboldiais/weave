import { unsafe } from "../aux.js";
import { Base } from "../base.js";
import { Edge, FigNode, Node2D } from "../index.js";
import { scopable } from "../scopable.js";
import { Space2D } from "../space2d.js";
import { typed } from "../typed.js";
import {
  add2D,
  distance2D,
  div2D,
  mag2D,
  mul2D,
  normalized2D,
  randInt,
  sub2D,
  v2,
  Vector,
  vector,
} from "@weave/math";
import { Graph } from "./graph.js";
import { Vertex } from "./vertex.js";

const PARTICLE = typed(scopable(Base));

export class Particle extends PARTICLE {
  p: Vector;
  a: Vector;
  r: number = 5;
  m: number = 1;
  v: Vector;
  vertex: Vertex;
  constructor(data: Vertex, position: Vector) {
    super();
    this.p = position;
    this.v = v2(0, 0);
    this.a = v2(0, 0);
    this.vertex = data;
    this.type = "force-particle";
  }
  place(time: number) {
    const displacement = mul2D(this.v, v2(time));
    this.p = add2D(this.p, displacement);
  }
  applyForce(force: Vector) {
    const accel = div2D(force, this.m);
    const f = add2D(this.a, accel);
    this.a = f;
  }
  get id() {
    return this.vertex.id;
  }
}

export const pt = (data: Vertex, position: Vector) => (
  new Particle(data, position)
);

const SPRING = typed(scopable(Base));

export class Spring extends SPRING {
  point1: Particle;
  point2: Particle;
  id: string | number;

  constructor(
    point1: Particle,
    point2: Particle,
    id: string | number,
  ) {
    super();
    this.point1 = point1;
    this.point2 = point2;
    this.type = "force-spring";
    this.id = id;
  }
}

const spring = (
  point1: Particle,
  point2: Particle,
  id: string | number,
) => (
  new Spring(point1, point2, id)
);

const FORCELAYOUT = typed(Space2D);

export class ForceSpace extends FORCELAYOUT {
  particles: Map<(string | number), Particle>;
  springs: Map<(string | number), Spring>;
  children: Node2D[] = [];
  graph: Graph;
  timestep: number = 0.03;
  D: number = 0.9;
  max_speed: number = Infinity;
  C_spring: number = 1;
  iterations: number = 100;
  epsilon: number = 0.0001;
  constructor(graph: Graph) {
    super();
    this.graph = graph;
    this.type = "force-graph";
    this.particles = new Map();
    this.springs = new Map();
  }
  L?: number;

  /**
   * The force layout’s computed
   * attraction constant.
   */
  get k() {
    if (this.L !== undefined) return this.L;
    const C = this.C_spring;
    const area = this.va;
    const num_vertices = this.graph.vertices.size;
    return C * Math.sqrt(area / num_vertices);
  }

  F_Repulsion(u: Vector, v: Vector) {
    const d = sub2D(u, v);
    const mag = mag2D(d);
    const pvpu = div2D(d, mag);
    const distance = distance2D(v, u);
    const k_squared = this.k * this.k;
    const f_r = (-k_squared) / distance;
    const f = mul2D(pvpu, v2(f_r));
    return f;
  }

  F_attract(u: Vector, v: Vector): Vector {
    const d = sub2D(v, u);
    const mag = mag2D(d);
    const distance = distance2D(v, u);
    const distance_squared = distance * distance;
    const pupv = div2D(d, mag);
    const f_a = distance_squared / this.k;
    return mul2D(pupv, v2(f_a));
  }

  coulomb() {
    this.forEachPt((p1) => {
      this.forEachPt((p2) => {
        if (p1.id !== p2.id) {
          const f_rep = this.F_Repulsion(p1.p, p2.p);
          p1.applyForce(f_rep);
          p2.applyForce(f_rep);
        }
      });
    });
  }

  hooke() {
    this.forEachSpring((spring) => {
      const f_spring = this.F_attract(spring.point1.p, spring.point2.p);
      spring.point1.applyForce(f_spring);
      spring.point2.applyForce(f_spring);
      return spring;
    });
  }

  forEachPt(callback: (particle: Particle) => void) {
    this.particles.forEach((p) => callback(p));
  }
  forEachSpring(callback: (spring: Spring, edge: Edge) => void) {
    this.graph.edges.forEach((edge) => {
      const source_target = this.springs.get(edge.id);
      const target_source = this.springs.get(edge.revid);
      if (source_target) {
        callback(source_target, edge);
      } else {
        const a = this.particles.get(edge.source.id)!;
        const b = this.particles.get(edge.target.id)!;
        const s = spring(a, b, edge.id);
        callback(s, edge);
        this.springs.set(edge.id, s);
      }
    });
  }

  totalEnergy() {
    let energy = 0;
    this.forEachPt((p) => {
      const speed = mag2D(p.v);
      energy += p.m * speed;
    });
    return energy;
  }

  /**
   * Sets the timestep for each iteration.
   */
  step(value: number) {
    this.timestep = value;
  }
  updateVelocity() {
    this.forEachPt((pt) => {
      const newAccel = mul2D(pt.a, v2(this.timestep));
      const newVelocity = add2D(pt.v, mul2D(newAccel, v2(this.D)));
      pt.v = newVelocity;
      if (mag2D(pt.v) > this.max_speed) {
        pt.v = mul2D(normalized2D(pt.v), v2(this.max_speed));
      }
      pt.a = v2(0, 0);
    });
  }
  updatePosition() {
    this.forEachPt((p) => {
      p.place(this.timestep);
    });
  }

  /**
   * Begins drawing the force graph.
   */
  figure() {
    this.setup();
    this.draw();
    return this;
  }
  draw() {
    const K = this.iterations;
    for (let i = 0; i < K; i++) {
      this.coulomb();
      this.hooke();
      this.updateVelocity();
      this.updatePosition();
      const t = this.totalEnergy();
      if (t < this.epsilon) break;
    }
  }

  setup() {
    const xs = this.scaleOf("x");
    const ys = this.scaleOf("y");
    this.graph.vertices.forEach((v) => {
      const x = randInt(xs(-2), xs(2));
      const y = randInt(ys(-2), ys(2));
      this.particles.set(v.id, pt(v, vector(x, y)));
    });
  }

  /**
   * Returns this spring graph’s particles.
   */
  vertices() {
    const vertices: Particle[] = [];
    this.particles.forEach((p) => vertices.push(p));
    return vertices;
  }

  /**
   * Returns this spring graph’s edges.
   */
  edges() {
    const edges: Spring[] = [];
    const ids = new Set<string>();
    this.graph.edges.forEach((e) => {
      const source = this.particles.get(e.source.id);
      const target = this.particles.get(e.target.id);
      if (source && target && !ids.has(e.id)) {
        edges.push(spring(source, target, e.id));
      }
      ids.add(e.id);
      ids.add(e.revid);
    });
    return edges;
  }

  /**
   * Includes additional nodes
   * to this graph’s plane.
   */
  and(nodes: Node2D[]) {
    nodes.forEach((n) => {
      n.scope(this);
      this.children.push(n);
    });
    return this;
  }
}

export const forceSpace = (graph: Graph) => (
  new ForceSpace(graph)
);

export const isForceSpace = (node: FigNode): node is ForceSpace => (
  !unsafe(node) && node.isType("force-graph")
);
