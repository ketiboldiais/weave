import { isNumber, isnum, sq } from './aux.js';

export class Vector {
  x: number;
  y: number;
  z: number;
  constructor(coord: [number, number, number] | [number, number]) {
    this.x = coord[0];
    this.y = coord[1];
    this.z = coord[2] !== undefined ? coord[2] : 0;
  }
  static from(value: number) {
    return new Vector([value, value, value]);
  }
  place(x: number, y: number, z: number = 0) {
    const out = this.copy([x, y, z]);
    return out;
  }
  copy(coord: [number, number, number] | [number, number]) {
    const clone = this.clone();
    clone.x = coord[0];
    clone.y = coord[1];
    clone.z = coord[2] !== undefined ? coord[2] : 0;
    return clone;
  }
  setMagnitude(newMagnitude: number) {
    const mag = this.magnitude();
    const ratio = newMagnitude / mag;
    return this.times(ratio);
  }
  array() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    return [x, y, z] as [number, number, number];
  }
  fold(f: (x: number, y: number, z: number) => number) {
    const v = this.clone();
    return f(v.x, v.y, v.z);
  }
  binaryOp(vector: Vector | number, f: (a: number, b: number) => number) {
    const other = isNumber(vector) ? Vector.from(vector) : vector;
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
    const array = this.array().map((element, i) => f(element, i)) as [number, number, number];
    return this.copy(array);
  }
  div(arg: Vector | number) {
    return this.binaryOp(arg, (a, b) => (b === 0 ? 0 : a / b));
  }
  static random() {
    const x = 10 * (Math.random() - 0.5);
    const y = 10 * (Math.random() - 0.5);
    const z = 10 * (Math.random() - 0.5);
    return new Vector([x, y, z]);
  }
  minus(arg: Vector | number) {
    const A = isnum(arg) ? Vector.from(arg) : arg;
    return new Vector([this.x - A.x, this.y - A.y, this.z - A.z]);
  }
  times(arg: Vector | number) {
    const A = isnum(arg) ? Vector.from(arg) : arg;
    return new Vector([this.x * A.x, this.y * A.y, this.z * A.z]);
  }
  add(arg: Vector | number) {
    const A = isnum(arg) ? Vector.from(arg) : arg;
    return new Vector([this.x + A.x, this.y + A.y, this.z + A.z]);
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
    return this.x === that.x && this.y === that.y && this.z === that.z;
  }

  magnitude() {
    return Math.sqrt(sq(this.x) + sq(this.y) + (this.z ? sq(this.z) : 0));
  }
  isZero() {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }

  normal() {
    return new Vector([-this.y, this.x]);
  }

  normalize() {
    if (this.isZero()) return this;
    const magSq = sq(this.x) + sq(this.y) + sq(this.z);
    const mag = magSq === 0 ? 1 : magSq;
    return this.div(mag);
  }

  clone() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const copy = new Vector([x, y, z]);
    return copy;
  }
}

export const vector = (coord: [number, number, number] | [number, number]) => {
  return new Vector(coord);
};
