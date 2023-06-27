import { Vertex, vtx } from "./vertex.js";

type EdgeType = "--" | "->";
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
