import { Datum } from "./base.js";
import { typed } from "../typed.js";
import { textual } from "../index.js";
import { Vertex } from "../index.js";
import { FigNode } from "../index.js";
import { unsafe } from "../aux.js";

const EDGE = typed(textual(Datum));
export class Edge extends EDGE {
  source: Vertex;
  target: Vertex;
  constructor(source: Vertex, target: Vertex) {
    super("");
    this.type = "edge";
    this.source = source;
    this.target = target;
    this.id = `${source.id}-${target.id}`;
  }
}

export const edge = (source: Vertex, target: Vertex) => {
  return new Edge(source, target);
};

export const isEdge = (node: FigNode): node is Edge =>
  !unsafe(node) && node.isType("edge");

export const edgekey = (sid: string, tid: string) =>
  `${sid}-${tid}`;
