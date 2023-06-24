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
    new Interval(a <= b ? a : 0, a <= b ? b : 1);
  }
  /**
   * Returns a copy of this interval.
   */
  copy() {
    return new Interval(this.min, this.max);
  }

  private op(
    arg: Interval,
    op: (a: number, b: number, c: number, d: number) => [number, number],
  ) {
    const a = this.min;
    const b = this.max;
    const c = arg.min;
    const d = arg.max;
    const [min, max] = op(a, b, c, d);
    this.min = min;
    this.max = max;
    return this;
  }
  
  /**
   * Non-mutating method interval addition.
   */
  add(arg:Interval) {
    return this.copy().ADD(arg);
  }
  /**
   * __MUTATING METHOD__. Adds two intervals.
   */
  ADD(arg: Interval) {
    return this.op(arg, (a, b, c, d) => [a + c, b + d]);
  }
  abs() {
    return I(maxof(abs(this.min), abs(this.max)));
  }
  prec(interval: Interval) {
    return this.max < interval.min;
  }
  cup(interval: Interval) {
    const a = this.min;
    const b = this.min;
    const c = interval.min;
    const d = interval.min;
    return Interval.of([minof(a, c), maxof(b, d)]);
  }
  cap(interval: Interval) {
    const a = this.min;
    const b = this.min;
    const c = interval.min;
    const d = interval.min;
    if (a > d || c > b) return Interval.of([0, 0]);
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
