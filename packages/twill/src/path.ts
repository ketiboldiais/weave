import { Vector } from "./vector.js";
import { Base } from "./base";
import { colorable } from "./colorable";
import { typed } from "./typed";
import { scopable } from "./scopable.js";
import { Line, line, ray } from "./line.js";
import { FigNode } from "./node.types.js";
import { unsafe } from "./aux.js";

const PATH = typed(colorable(scopable(Base)));

export class Path extends PATH {
  data: Line[] = [];
  origin: Vector;
  cursor: Vector;
  lastType: "ray" | "line";
  constructor(origin: Vector) {
    super();
    this.origin = origin;
    this.cursor = origin;
    this.type = "path";
    this.lastType = "ray";
  }
  /**
   * Closes the path. This will return the cursor 
   * back to the origin.
   */
  z() {
    const cursor = this.cursor;
    const origin = this.origin;
    const last = (this.lastType === "line")
      ? line(cursor, origin)
      : ray(cursor, origin);
    this.data.push(last);
    this.cursor = origin;
    return this;
  }
  vector(v: Vector | number[]): Vector {
    return Array.isArray(v) ? (Vector.from(v)) : v;
  }

  /**
   * Moves the cursor position to
   * the provided position and sets
   * the cursor position to the new
   * position. This will render as a line.
   */
  L(v: Vector | number[]) {
    const vector = this.vector(v);
    const r = line(this.cursor, vector);
    this.data.push(r);
    this.cursor = vector;
    this.lastType = "line";
    return this;
  }
  /**
   * Adds the provided vector to the current
   * cursor position and updates the cursor
   * position. This will render as a line.
   */
  l(v: Vector | number[]) {
    const vector = this.vector(v);
    const next = this.cursor.add(vector);
    const r = line(this.cursor, next);
    this.data.push(r);
    this.cursor = next;
    this.lastType = "line";
    return this;
  }
  /**
   * Moves the cursor position to
   * the provided position and sets
   * the cursor position to the new
   * position. This will render as a
   * ray.
   */
  M(v: Vector | number[]) {
    const vector = this.vector(v);
    const r = ray(this.cursor, vector);
    this.data.push(r);
    this.cursor = vector;
    this.lastType = "ray";
    return this;
  }
  /**
   * Adds the provided vector to the current
   * cursor position and updates the cursor
   * position. This will render as a ray.
   */
  m(v: Vector | number[]) {
    const vector = this.vector(v);
    const next = this.cursor.add(vector);
    const r = ray(this.cursor, next);
    this.data.push(r);
    this.cursor = next;
    this.lastType = "ray";
    return this;
  }
}

export const path = (origin: Vector | number[]) => {
  return new Path(
    Array.isArray(origin) ? Vector.from(origin) : origin,
  );
};
export const isPath = (node: FigNode): node is Path => (
  !unsafe(node) && node.isType("path")
);
