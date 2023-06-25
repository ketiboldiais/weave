import { abs, maxof, minof, safer } from "./aux.js";

export class Interval {
  min: number;
  max: number;
  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }
  get width() {
    return (this.max - this.min);
  }
  get midpoint() {
    return (this.width / 2);
  }
  static of(I: number[]) {
    const a = safer(I[0], 0);
    const b = safer(I[1], 1);
    return new Interval(a <= b ? a : 0, a <= b ? b : 1);
  }
  /**
   * Returns a copy of this interval.
   */
  copy() {
    return new Interval(this.min, this.max);
  }

  private op(
    arg: Interval | number[],
    op: (a: number, b: number, c: number, d: number) => [number, number],
  ) {
    const that = Array.isArray(arg) ? Interval.of(arg) : arg;
    const a = this.min;
    const b = this.max;
    const c = that.min;
    const d = that.max;
    const [min, max] = op(a, b, c, d);
    this.min = min;
    this.max = max;
    return this;
  }
  div(arg: Interval | number[]) {
    return this.copy().DIV(arg);
  }
  DIV(arg: Interval | number[]) {
    return this.op(arg, (a, b, c, d) => {
      return [
        (c === 0 || d === 0) ? -Infinity : minof(a / c, a / d, b / c, b / d),
        (c === 0 || d === 0) ? Infinity : maxof(a / c, a / d, b / c, b / d),
      ];
    });
  }
  mul(arg: Interval | number[]) {
    return this.copy().MUL(arg);
  }
  MUL(arg: Interval | number[]) {
    return this.op(arg, (a, b, c, d) => [
      minof(a * c, a * d, b * c, b * d),
      maxof(a * c, a * d, b * c, b * d),
    ]);
  }
  /**
   * __Non-mutating method.__ Returns the difference
   * between (a copy) of this interval and the provided
   * interval.
   */
  sub(arg: Interval | number[]) {
    return this.copy().SUB(arg);
  }
  /**
   * __MUTATING METHOD__. Subtracts two intervals.
   */
  SUB(arg: Interval | number[]) {
    return this.op(arg, (a, b, c, d) => [a - d, b - c]);
  }
  /**
   * Non-mutating method interval addition.
   */
  add(arg: Interval | number[]) {
    return this.copy().ADD(arg);
  }
  /**
   * __MUTATING METHOD__. Adds two intervals.
   */
  ADD(arg: Interval | number[]) {
    return this.op(arg, (a, b, c, d) => [a + c, b + d]);
  }
  abs() {
    return I(maxof(abs(this.min), abs(this.max)));
  }

  /**
   * Returns true if this interval
   * strictly succeeds (“comes after”)
   * the provided interval.
   */
  succeeds(interval: Interval) {
    return interval.max < this.min;
  }

  /**
   * Returns true if this interval
   * strictly precedes (“comes before”)
   * the provided interval.
   */
  precedes(interval: Interval) {
    return this.max < interval.min;
  }
  /**
   * Returns the union of this
   * interval and the provided interval.
   */
  cup(interval: Interval) {
    const a = this.min;
    const b = this.min;
    const c = interval.min;
    const d = interval.min;
    return Interval.of([minof(a, c), maxof(b, d)]);
  }
  /**
   * Returns the intersection (an interval) of this
   * interval and the provided interval.
   * If the interval does not exist,
   * returns null.
   */
  cap(interval: Interval) {
    const a = this.min;
    const b = this.min;
    const c = interval.min;
    const d = interval.min;
    if (a > d || c > b) return null;
    return Interval.of([maxof(a, c), minof(b, d)]);
  }
  equals(interval: Interval) {
    return (
      this.min === interval.min &&
      this.max === interval.max
    );
  }
}

/**
 * Returns a new interval.
 */
export const I = (a: number, b: number = a) => (
  Interval.of([a, b])
);
