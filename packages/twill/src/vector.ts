import { isNumber, sq } from "./aux.js";

export class Vector {
  ox: number = 0;
  oy: number = 0;
  oz: number = 0;
  origin(
    coord: [number, number, number] | [number, number]
  ) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const ox = coord[0];
    const oy = coord[1];
    const oz = coord[2] !== undefined ? coord[2] : 0;
    const out = new Vector([x, y, z]);
    out.ox = ox;
    out.oy = oy;
    out.oz = oz;
    return out;
  }
  x: number;
  y: number;
  z: number;
  constructor(
    coord: [number, number, number] | [number, number]
  ) {
    this.x = coord[0];
    this.y = coord[1];
    this.z = coord[2] !== undefined ? coord[2] : 0;
  }
  static from(value: number) {
    return new Vector([value, value, value]);
  }
  copy(coord: [number, number, number] | [number, number]) {
    const clone = this.clone();
    clone.x = coord[0];
    clone.y = coord[1];
    clone.z = coord[2] !== undefined ? coord[2] : 0;
    return clone;
  }
  originXYZ() {
    const ox = this.ox;
    const oy = this.oy;
    const oz = this.oz;
    return [ox, oy, oz] as [number, number, number];
  }
  array() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    return [x, y, z] as [number, number, number];
  }
  fold(
    f: (
      x: number,
      y: number,
      z: number,
      originX: number,
      originY: number,
      originZ: number
    ) => number
  ) {
    const v = this.clone();
    return f(v.x, v.y, v.z, v.ox, v.oy, v.oz);
  }
  binaryOp(
    vector: Vector | number,
    f: (a: number, b: number) => number
  ) {
    const other = isNumber(vector)
      ? Vector.from(vector)
      : vector;
    const ax = this.x;
    const bx = other.x;
    const x = f(ax, bx);

    const ay = this.y;
    const by = other.y;
    const y = f(ay, by);

    const az = this.z;
    const bz = other.z;
    const z = f(az, bz);
    return other.copy([x, y, z]);
  }
  unaryOp(f: (element: number, index: number) => number) {
    const array = this.array().map((element, i) =>
      f(element, i)
    ) as [number, number, number];
    return this.copy(array);
  }
  div(arg: Vector | number) {
    return this.binaryOp(arg, (a, b) =>
      b === 0 ? 0 : a / b
    );
  }
  static random() {
    const x = 10 * (Math.random()-.5);
    const y = 10 * (Math.random()-.5);
    const z = 10 * (Math.random()-.5);
    return new Vector([x,y,z]);
  }
  minus(arg: Vector | number) {
    return this.binaryOp(arg, (a, b) => a - b);
  }
  times(arg: Vector | number) {
    return this.binaryOp(arg, (a, b) => a * b);
  }
  add(arg: Vector | number) {
    return this.binaryOp(arg, (a, b) => a + b);
  }
  pos() {
    return this.unaryOp((e) => (e === 0 ? 0 : Math.abs(e)));
  }
  neg() {
    return this.unaryOp((e) => (e === 0 ? 0 : -e));
  }
  zero() {
    return this.unaryOp((_) => 0);
  }
  equals(that: Vector) {
    return (
      this.x === that.x &&
      this.y === that.y &&
      this.z === that.z
    );
  }

  magnitude() {
    return this.fold((x, y, z) => {
      const out = Math.sqrt(sq(x) + sq(y) + sq(z));
      return out;
    });
  }
  isZero() {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }
  normal() {
    return new Vector([-this.y, this.x, this.z]);
  }

  normalized() {
    if (this.isZero()) return this;
    const magnitude = this.magnitude();
    return this.div(magnitude);
  }

  clone() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const ox = this.ox;
    const oy = this.oy;
    const oz = this.oz;
    const copy = new Vector([x, y, z]).origin([ox, oy, oz]);
    return copy;
  }
}

export const vector = (
  coord: [number, number, number] | [number, number]
) => {
  return new Vector(coord);
};
