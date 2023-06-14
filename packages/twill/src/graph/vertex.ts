import { typed } from "../typed.js";
import { textual } from "../index.js";
import { Vector } from "../vector.js";
import { FigNode } from "../index.js";
import { unsafe } from "../aux.js";

const VERTEX2D = typed(textual(Vector));

export class Vertex extends VERTEX2D {
  constructor(name: string) {
    super([0, 0]);
    this.label = name;
    this.type = "vertex";
    this.id = name;
  }
}

export const vertex = (name: string | number): Vertex => {
  return new Vertex(`${name}`);
};

export const isVertex = (node: FigNode): node is Vertex =>
  !unsafe(node) && node.isType("vertex");
