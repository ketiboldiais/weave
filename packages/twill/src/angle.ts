import { toDeg, toRadians, unsafe } from "./aux.js";
import { Base } from "./base";
import { colorable } from "./colorable";
import { Arc, arc, FigNode, Line, line, ray } from "./index.js";
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
  static from(data: [number, AngleUnit] | Angle): Angle {
    if (Array.isArray(data)) {
      return new Angle(data[0], data[1]);
    } else return data;
  }

  copy() {
    const value = this.value;
    const unit = this.unit;
    const origin = this.origin.copy();
    const initial = this.initial.clone();
    const terminal = this.terminal.clone();
    const out = new Angle(value, unit);
    out.origin = origin;
    out.initial = initial;
    out.terminal = terminal;
    return out;
  }
  vector(of: "initial" | "terminal") {
    if (of === "initial") {
      return this.initial.displacement();
    } else {
      return this.terminal.displacement();
    }
  }

  marker?: Arc;
  constructor(value: number, unit: AngleUnit) {
    super();
    this.type = "angle";
    this.value = value;
    this.unit = unit;
    this.origin = vector(0, 0);
    this.initial = ray(this.origin, [1, 0]);
    this.terminal = ray(this.origin, [1, 0]).rotate(value, unit);
  }
	degs() {
		if (this.unit==='rad') return toDeg(this.value);
		return this.value;
	}
	rads() {
		if (this.unit==='rad') return this.value;
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

export const angle = (measure: number, unit: AngleUnit) => {
  return new Angle(measure, unit);
};

export const isAngle = (node: FigNode): node is Angle => (
  !unsafe(node) && node.isType("angle")
);
