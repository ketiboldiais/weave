import { Vertex, vtx } from "./vertex.js";

export type EdgeType = "--" | "->";
export class Edge<T = any, K = any> {
  source: Vertex<T>;
  target: Vertex<T>;
  direction: EdgeType;
  id: string;
  meta: K | null;
  constructor(
    source: Vertex<T>,
    target: Vertex<T>,
    direction: EdgeType,
    metadata: K | null = null,
  ) {
    this.source = source;
    this.target = target;
    this.direction = direction;
    this.id = `${source.id}${direction}${target.id}`;
    this.meta = metadata;
  }
  /**
   * Returns true if this edge is equivalent to the other
   * edge. Where:
   *
   * - 𝑆₁ is the source id of this edge,
   * - 𝑆₂ is the source id of the other edge,
   * - 𝑇₁ is the target id of this edge, and
   * - 𝑇₂ is the target id of the other edge,
   *
   * the equivalence relation is defined as follows:
   * 1. If the edges are of different directions (`--` and `->` or vice versa), the
   *    edges are not equivalent.
   * 2. If the edges are both directed (`--`), the edges are equivalent
   *    only if:
   *    ~~~
   *    (𝑆₁ = 𝑆₂) AND (𝑇₁ = 𝑇₂).
   *    ~~~
   * 3. If the edges are undirected, the edges are equivalent only if:
   *    ~~~
   *    ((𝑆₁ = 𝑆₂) AND (𝑇₁ = 𝑇₂))  OR  ((𝑆₁ = 𝑇₂) AND (𝑇₁ = 𝑆₂))
   *    ~~~
   * @example
   * ~~~
   * // a and b are equivalent since they’re undirected:
   * // 1--2 and 2--1
   * const a = edge(1,2)
   * const b = edge(2,1)
   *
   * // c and d are equivalent since 1->2 and 1->2.
   * // e is not equivalent to either since it’s the directed
   * // edge 2->1
   * const c = link(1,2)
   * const d = link(1,2)
   * const e = link(2,1)
   * ~~~
   */
  isEquivalent(other: Edge) {
    const s1 = this.source.id;
    const t1 = this.target.id;
    const s2 = other.source.id;
    const t2 = other.target.id;
    if (this.direction === "->" && other.direction === "->") {
      return (s1 === s2) && (t1 === t2);
    }
    if (this.direction === "--" && other.direction === "--") {
      return ((s1 === s2 && t1 === t2) || (s1 === t2 && t1 === s2));
    }
    return false;
  }
  obj() {
    const source = this.source.obj();
    const target = this.target.obj();
    const id = this.id;
    const meta = this.meta;
    return { source, target, id, meta };
  }
  reverse() {
    const out = new Edge(this.target, this.source, this.direction);
    out.meta = this.meta;
    out.id = `${this.target.id}${this.direction}${this.source.id}`;
    return out;
  }
  metamap<X>(callback: (metadata: K) => X) {
    const metadata = this.meta;
    if (metadata === null) {
      return this as any as Edge<T, X>;
    }
    const m = callback(metadata);
    return new Edge(this.source, this.target, this.direction, m);
  }

  get isUndirected() {
    return this.direction === "--";
  }
  get isDirected() {
    return this.direction === "->";
  }
  get revid() {
    return `${this.target.id}${this.direction}${this.source.id}`;
  }
  copy() {
    const out = new Edge(this.source, this.target, this.direction);
    return out;
  }
  undirected() {
    if (!this.isDirected) return this;
    return new Edge(this.source, this.target, "--", this.meta);
  }
  direct() {
    if (this.isDirected) return this;
    return new Edge(this.source, this.target, "->", this.meta);
  }
}

export const edge = (
  source: string | number | Vertex,
  target: string | number | Vertex,
) => (
  new Edge(
    (typeof source === "string" || typeof source === "number")
      ? vtx(source)
      : source,
    (typeof target === "string" || typeof target === "number")
      ? vtx(target)
      : target,
    "--",
  )
);

export const link = (
  source: string | number | Vertex,
  target: string | number | Vertex,
) => (
  new Edge(
    (typeof source === "string" || typeof source === "number")
      ? vtx(source)
      : source,
    (typeof target === "string" || typeof target === "number")
      ? vtx(target)
      : target,
    "->",
  )
);
