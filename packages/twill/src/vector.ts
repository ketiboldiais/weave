import { isNumber, round } from "./aux.js";
import { line } from "./line.js";

export class Vector {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  origin(x: number, y: number, z: number = 0) {
    return this;
  }

  /**
   * Returns a vector corresponding to the displacement
   * from the provided vector to this vector.
   */
  from(other: Vector) {
    const out = vector(this.x, this.y, this.z).origin(other.x, other.y, other.z);
    return out;
  }

  /**
   * Returns a vector corresponding to the displacement
   * from this vector to the provided vector.
   */
  to(other: Vector) {
    const out = vector(other.x, other.y, other.z).origin(this.x, this.y, this.z);
    return out;
  }

  /**
   * Returns the angle between this
   * vector and the provided vector.
   */
  angleBetween(other: Vector) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const gamma = Math.atan2(dy, dx);
    return gamma;
  }
  move(other: Vector) {
    const v = this.add_(other);
    v.origin(this.x, this.y);
    return v;
  }

  /**
   * Returns a vector where each component is the
   * provided value.
   */
  static from(value: number) {
    return new Vector(value, value, value);
  }

  place_(x: number, y: number, z: number = 0) {
    return new Vector(x, y, z);
  }
  place(x: number, y: number, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  magnify(newMagnitude: number) {
    const mag = this.mag();
    const ratio = newMagnitude / mag;
    return this.mul(ratio);
  }

  array() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    return [x, y, z] as [number, number, number];
  }

  binaryOp(vector: Vector | number, f: (a: number, b: number) => number) {
    const other = isNumber(vector) ? Vector.from(vector) : vector;
    const ax = this.x;
    const bx = other.x;
    const x = f(ax, bx);
    this.x = x;

    const ay = this.y;
    const by = other.y;
    const y = f(ay, by);
    this.y = y;

    const az = this.z;
    const bz = other.z;
    const z = f(az, bz);
    this.z = z;

    return this;
  }

  unaryOp(f: (element: number, index: number) => number) {
    this.x = f(this.x, 0);
    this.y = f(this.y, 1);
    this.z = f(this.z, 2);
    return this;
  }

  divide(arg: Vector | number) {
    return this.clone().div(arg);
  }
  div(arg: Vector | number) {
    return this.binaryOp(
      arg, (a, b) => (b === 0 ? 0 : a / b)
    );
  }

  subtract(arg: Vector | number) {
    return this.clone().sub(arg);
  }
  sub(arg: Vector | number) {
    return this.binaryOp(arg, (a, b) => a - b);
  }

  mul_(arg: Vector | number) {
    return this.clone().mul(arg);
  }

  mul(arg: Vector | number) {
    return this.binaryOp(arg, (a, b) => a * b);
  }

  add_(arg: Vector | number) {
    return this.clone().add(arg);
  }

  add(arg: Vector | number) {
    return this.binaryOp(arg, (a, b) => a + b);
  }

  pos_() {
    return this.clone().pos();
  }

  pos() {
    return this.unaryOp((e) => (e === 0 ? 0 : Math.abs(e)));
  }

  neg_() {
    return this.clone().neg();
  }

  neg() {
    return this.unaryOp((e) => (e === 0 ? 0 : -e));
  }

  zero_() {
    return new Vector(0, 0, 0);
  }

  zero() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
  }

  equals(that: Vector) {
    return this.x === that.x && this.y === that.y && this.z === that.z;
  }

  /**
   * Returns this magnitude of this vector.
   */
  mag(precision?: number) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const xyz = (x * x) + (y * y) + (z * z);
    let out = Math.sqrt(xyz);
    if (precision !== undefined) {
      out = round(out, precision);
    }
    return out;
  }

  isZero() {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }

  normal_() {
    return this.clone().normal();
  }
  normal() {
    if (this.isZero()) return this;
    return this.div(this.mag());
  }
  dot(other:Vector) {
    const x = other.x * this.x;
    const y = other.y * this.y;
    const z = other.z * this.z;
    return (x+y+z)
  }

  clone() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const copy = new Vector(x, y, z);
    return copy;
  }
}

export const vector = (
  x: number,
  y: number,
  z: number = 0,
) => new Vector(x, y, z);

export const magnitude = (v: Vector) => {
};
