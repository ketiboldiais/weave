import { Interval } from "./index.js";

export class ContinuousScale {
  domain: Interval;
  range: Interval;
  constructor(domain: Interval, range: Interval) {
    this.domain = domain;
    this.range = range;
  }
}

export class LinearScale extends ContinuousScale {
  constructor(domain: Interval, range: Interval) {
    super(domain, range);
  }

  scale(value: number) {
  }
}
