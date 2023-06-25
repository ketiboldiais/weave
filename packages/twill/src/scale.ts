import { I, Interval } from "./index.js";

export abstract class RealScale {
  dom: Interval;
  ran: Interval;
  constructor(domain: Interval, range: Interval) {
    this.dom = domain;
    this.ran = range;
  }
  domain(min: number, max: number) {
    this.dom = I(min, max);
    return this;
  }
  range(min: number, max: number) {
    this.ran = I(min, max);
    return this;
  }
  get minValue() {
    return this.dom.min;
  }
  get maxValue() {
    return this.dom.max;
  }
  get minScale() {
    return this.ran.min;
  }
  get maxScale() {
    return this.ran.max;
  }
  get ratio() {
    return (this.ran.width / this.dom.width);
  }
}

class LinearScale extends RealScale {
  constructor(domain: Interval, range: Interval) {
    super(domain, range);
  }
  scale(value: number) {
    const res = this.minScale + (this.ratio * (value - this.minValue));
    if (res === Infinity) return this.maxScale;
    if (res === -Infinity) return this.minScale;
    if (isNaN(res)) return this.minScale;
    return res;
  }
}

export const linearScale = (domain: number[], range: number[]) => (
  new LinearScale(Interval.of(domain), Interval.of(range))
);
