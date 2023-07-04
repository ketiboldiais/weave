import { unsafe } from "../aux.js";
import { Base } from "../base.js";
import { Edge, FigNode, Node2D } from "../index.js";
import { scopable } from "../scopable.js";
import { Space2D } from "../space2d.js";
import { typed } from "../typed.js";
import { randInt, v2, Vector, vector } from "@weave/math";
import { Graph } from "./graph.js";
import { Vertex } from "./vertex.js";

const PARTICLE = typed(scopable(Base));

export class Particle extends PARTICLE {
  p: Vector;
  a: Vector;
  r: number = 5;
  m: number = 3;
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
  applyForce(force: Vector) {
    this.a = this.a.add(force.div(this.m));
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
  data: Edge,
) => (
  new Spring(point1, point2, data.id)
);

const FORCELAYOUT = typed(Space2D);

export class ForceSpace extends FORCELAYOUT {
  particles: Map<(string | number), Particle>;
  springs: Map<(string | number), Spring>;
  children: Node2D[] = [];
  graph: Graph;
  D: number = 0.4;
  L: number = 30;
  K: number = 100;
  C: number = 300 * 300;
  iterations: number = 100;
  epsilon: number = 0.0001;
  constructor(graph: Graph) {
    super();
    this.graph = graph;
    this.type = "force-graph";
    this.particles = new Map();
    this.springs = new Map();
  }
  coulomb() {
    this.forEachPt((p1) => {
      this.forEachPt((p2) => {
        if (p1.id !== p2.id) {
          const d = p1.p.sub(p2.p);
          const distance = d.mag() + 0.1;
          const direction = d.normalize();
          p1.applyForce(direction.mul(this.C).div(distance * distance * 0.5));
          p2.applyForce(direction.mul(this.C).div(distance * distance * -0.5));
        }
      });
    });
  }

  totalEnergy() {
    let energy = 0;
    this.forEachPt((p) => {
      const speed = p.v.mag();
      energy += 0.5 * p.m * speed;
    });
    return energy;
  }

  hooke() {
    this.forEachSpring((spring) => {
      const d = spring.point2.p.sub(spring.point1.p);
      const displacement = d.mag() - this.L;
      const direction = d.normalize();
      spring.point1.applyForce(direction.mul(this.K * displacement * 0.5));
      spring.point2.applyForce(direction.mul(this.K * displacement * -0.5));
    });
  }

  forEachPt(callback: (particle: Particle) => void) {
    this.particles.forEach((p) => callback(p));
  }
  forEachSpring(callback: (spring: Spring) => void) {
    this.graph.edges.forEach((edge) => {
      const sp = this.springs.get(edge.id);
      if (sp) {
        callback(sp);
      } else {
        const a = this.particles.get(edge.source.id)!;
        const b = this.particles.get(edge.target.id)!;
        const s = spring(a, b, edge);
        callback(s);
        this.springs.set(edge.id, s);
      }
    });
  }
  updateVelocity() {
    this.forEachPt((pt) => {
      pt.v = pt.v.add(pt.a.mul(0.03)).mul(this.D);
      pt.a = v2(0, 0);
    });
  }
  updatePosition() {
    this.forEachPt((p) => {
      p.p = p.p.add(p.v.mul(0.03));
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
      const x = randInt(xs(-1), xs(1));
      const y = randInt(ys(-1), ys(1));
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
        edges.push(spring(source, target, e));
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
