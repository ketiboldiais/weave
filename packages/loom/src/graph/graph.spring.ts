import { unsafe } from "../aux.js";
import { Base } from "../base.js";
import { FigNode, isGroup, Line, line, Node2D } from "../index.js";
import { definable, scopable } from "../mixins/scopable.js";
import { typed } from "../mixins/typed.js";
import { add2D, clamp, randInt, sub2D, v2, Vector, vector } from "@weave/math";
import { Graph } from "./graph.js";

const rsq = (v: Vector, u: Vector) => (
  ((v.x - u.x) ** 2) + ((v.y - u.y) ** 2)
);

const PARTICLE = typed(scopable(Base));

export class Particle extends PARTICLE {
  p: Vector;
  r: number;
  v: Vector;
  f: Vector;
  id: string | number;
  constructor(id: string | number, position: Vector) {
    super();
    this.p = position;
    this.r = 5;
    this.v = v2(0, 0);
    this.f = v2(0, 0);
    this.id = id;
    this.type = "force-particle";
  }
}

export const pt = (id: string | number, position: Vector) => (
  new Particle(id, position)
);

const FORCELAYOUT = typed(definable(Base));
export class ForceSpace extends FORCELAYOUT {
  private particles: Map<(string | number), Particle>;
  private graph: Graph;
  children: Node2D[] = [];

  ITERATIONS: number = 200;
  /**
   * Sets the number of iterations
   * the force layout should run
   * for.
   */
  iterations(value: number) {
    this.ITERATIONS = value;
    return this;
  }

  EPSILON: number = 0.5;
  /**
   * Sets the minimum energy
   * threshhold indicating
   * when the layout has
   * reached equilibrium.
   */
  epsilon(value: number) {
    this.EPSILON = value;
    return this;
  }
  private STABLE: boolean = false;

  REPULSION: number = 20;
  /**
   * Sets the repulsion constant
   * for this layout.
   */
  repulsion(value: number) {
    this.REPULSION = value;
    return this;
  }

  ATTRACTION: number = 0.06;
  /**
   * Sets the attraction constant
   * for this layout.
   */
  attraction(value: number) {
    this.ATTRACTION = value;
    return this;
  }

  DECAY: number = 0.9;
  /**
   * Sets the decay value
   * for this layout.
   */
  decay(value: number) {
    this.DECAY = value;
    return this;
  }

  constructor(graph: Graph) {
    super();
    this.graph = graph;
    this.type = "force-graph";
    this.particles = new Map();
  }

  private forEachPt(callback: (particle: Particle) => void) {
    this.particles.forEach((p) => callback(p));
  }

  /**
   * Begins drawing the force graph.
   */
  figure() {
    this.scatter();
    this.layout();
    return this;
  }
  private layout() {
    const xs = this.space.dscale();
    const ys = this.space.rscale();
    const MIN_X = xs(this.space.domainMin);
    const MAX_X = xs(this.space.domainMax);
    const MIN_Y = ys(this.space.rangeMax);
    const MAX_Y = ys(this.space.rangeMin);
    for (let i = 0; i < this.ITERATIONS; i++) {
      this.iterate(MIN_X, MAX_X, MIN_Y, MAX_Y);
      if (this.STABLE) break;
    }
  }

  private iterate(
    MIN_X: number,
    MAX_X: number,
    MIN_Y: number,
    MAX_Y: number,
  ) {
    this.forEachPt((v) => {
      v.f = v2(0, 0);
      this.forEachPt((u) => {
        if (v.id !== u.id) {
          let d2 = rsq(v.p, u.p);
          if (d2 === 0) d2 = 0.001;
          const c = this.REPULSION / d2;
          const f = sub2D(v.p, u.p).mul(c);
          v.f.ADD(f);
        }
      });
    });
    this.graph.edges.forEach((e) => {
      const u = this.particles.get(e.source.id);
      const v = this.particles.get(e.target.id);
      if (u && v) {
        const f = sub2D(u.p, v.p).MUL(this.ATTRACTION);
        v.f.ADD(f);
      }
    });
    let displacement = 0;
    this.forEachPt((v) => {
      v.v = add2D(v.v, v.f).MUL(this.DECAY);
      displacement += (Math.abs(v.v.x)) + Math.abs(v.v.y);
      v.p.ADD(v.v);
      v.p.x = clamp(MIN_X, v.p.x, MAX_X);
      v.p.y = clamp(MIN_Y, v.p.y, MAX_Y);
    });
    this.STABLE = displacement < this.EPSILON;
  }

  private scatter() {
    const xs = this.space.dscale();
    const ys = this.space.rscale();
    this.graph.vertices.forEach((v) => {
      const x = randInt(xs(-2), xs(2));
      const y = randInt(ys(-2), ys(2));
      this.particles.set(v.id, pt(v.id, vector(x, y)));
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
  edges(): Line[] {
    const edges: Line[] = [];
    const ids = new Set<string>();
    this.graph.edges.forEach((e) => {
      const source = this.particles.get(e.source.id);
      const target = this.particles.get(e.target.id);
      if (source && target && !ids.has(e.id)) {
        const x1 = source.p.x;
        const y1 = source.p.y;
        const x2 = target.p.x;
        const y2 = target.p.y;
        const l = line([x1, y1], [x2, y2]).scope(this.space);
        edges.push(l);
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
    nodes.forEach((node) => {
      if (isGroup(node)) {
        node.nodes.forEach((n) => {
          this.children.push(n);
        });
      } else {
        node.scope(this.space);
        this.children.push(node);
      }
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
