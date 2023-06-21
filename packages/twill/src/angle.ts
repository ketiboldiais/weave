import { toDeg, toRadians, unsafe } from "./aux.js";
import { Base } from "./base";
import { colorable } from "./colorable";
import { Arc, FigNode, Line, arc, line, ray } from "./index.js";
import { anglevalue } from "./parsers.js";
import { scopable } from "./scopable.js";
import { typed } from "./typed";
import { Vector, vector } from "./vector.js";

export type AngleUnit = "deg" | "rad";
const ANGLE = typed(colorable(scopable(Base)));
export class Angle extends ANGLE {
  value: number;
  unit: AngleUnit;
  origin: Vector;
  initial: Line;
  terminal: Line;
  children: (Arc|Line)[] = [];
  armLength: number = 1;
  
  /**
   * Includes an arc marking this angle.
   */
  mark() {
    const a = arc(angle(this.value, this.unit));
    this.children.push(a);
    return this;
  }

  /**
   * Adds another arm to this angle. If a number
   * is passed, the angle is quantified with the
   * angle’s current unit (either degrees or radians).
   * If a string is passed, the angle will be parsed
   * and quantified according to the passed unit. A failed
   * parsing will include an arm angle at 0 radians.
   * An optional callback may be passed
   * to modify the resulting line’s properties.
   */
  arm(angle: string | number, callback?: (line: Line) => Line) {
    if (typeof angle === "string") {
      const { value, unit } = anglevalue.parse(angle).result.unwrap({
        value: 0,
        unit: "rad",
      });
      const r = ray(this.origin, [this.armLength, this.origin.y])
        .rotate(value, unit);
      this.children.push(
        callback ? callback(r).lock() : r.opacity(0.2).lock(),
      );
    } else {
      const r = ray(this.origin, [this.armLength, this.origin.y])
        .rotate(angle, this.unit);
      this.children.push(
        callback ? callback(r).lock() : r.opacity(0.2).lock(),
      );
    }
    return this;
  }

  /**
   * Includes a line corresponding to the side
   * opposite this angle. An optional callback
   * may be provided to modify the resulting
   * line’s properties.
   */
  opp(callback?: (line: Line) => Line) {
    const x1 = this.terminal.x;
    const y1 = this.terminal.y;
    const x2 = this.terminal.x;
    const y2 = this.origin.y;
    const l = line([x1, y1], [x2, y2]);
    this.children.push(
      callback ? callback(l).lock() : l.dash(2).lock(),
    );
    return this;
  }

  copy() {
    const value = this.value;
    const unit = this.unit;
    const origin = this.origin.copy();
    const initial = this.initial.clone();
    const terminal = this.terminal.clone();
    const out = new Angle(value, unit);
    const children = this.children;
    out.origin = origin;
    out.initial = initial;
    out.terminal = terminal;
    out.children = [...children];
    return out;
  }
  vector(of: "initial" | "terminal") {
    if (of === "initial") {
      return this.initial.displacement();
    } else {
      return this.terminal.displacement();
    }
  }

  constructor(value: number, unit: AngleUnit) {
    super();
    this.type = "angle";
    this.value = value;
    this.unit = unit;
    this.origin = vector(0, 0);
    this.initial = ray(this.origin, [this.armLength, this.origin.y]);
    this.terminal = ray(this.origin, [this.armLength, this.origin.y]).rotate(
      value,
      unit,
    );
  }
  degs() {
    if (this.unit === "rad") return toDeg(this.value);
    return this.value;
  }
  rads() {
    if (this.unit === "rad") return this.value;
    return toRadians(this.value);
  }
  get cy() {
    return this.origin.y;
  }
  get cx() {
    return this.origin.x;
  }
  toDeg() {
    const out = this.copy();
    if (out.unit === "rad") {
      out.value = toDeg(out.value);
      out.unit = "deg";
    }
    return out;
  }
  toRadians() {
    const out = this.copy();
    if (out.unit === "deg") {
      out.value = toRadians(out.value);
      out.unit = "rad";
    }
    return out;
  }

  tsl(value: number) {
    return this;
  }
  isl(value: number) {
    return this;
  }
  vertex(x: number, y: number) {
    this.origin = vector(x, y);
    return this;
  }
}

export const angle = (
  value: string | number,
  unit: AngleUnit = "rad",
): Angle => {
  if (typeof value === "string") {
    const parsing = anglevalue.parse(value).result.unwrap(
      { value: 0, unit: "rad" },
    );
    return new Angle(parsing.value, parsing.unit);
  } else {
    return new Angle(value, unit);
  }
};

export const isAngle = (node: FigNode): node is Angle => (
  !unsafe(node) && node.isType("angle")
);
