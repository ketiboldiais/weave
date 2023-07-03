export class LinearScale {
  dom: number[];
  ran: number[];
  constructor(domain: number[], range: number[]) {
    this.dom = domain;
    this.ran = range;
  }
  minValue() {
    return this.dom[0];
  }
  maxValue() {
    return this.dom[1];
  }
  minScale() {
    return this.ran[0];
  }
  maxScale() {
    return this.ran[1];
  }
  ywidth() {
    return this.ran[1] - this.dom[0];
  }
  xwidth() {
    return this.dom[1] - this.dom[0];
  }
  ratio() {
    return (this.ywidth() / this.xwidth());
  }
  scale(value: number) {
    const res = this.minScale() + (this.ratio() * (value - this.minValue()));
    if (res === Infinity) return this.maxScale();
    if (res === -Infinity) return this.minScale();
    if (isNaN(res)) return this.minScale();
    return res;
  }
}

const ScaleFactory = (
  interpolate: (
    inputValue: number,
    minscale: number,
    maxscale: number,
    minval: number,
    maxval: number,
    ratio: number,
  ) => number,
) =>
(
  domain: number[],
  range: number[],
) =>
(inputValue: number) =>
  interpolate(
    inputValue,
    range[0],
    range[1],
    domain[0],
    domain[1],
    (range[1] - range[0]) / (domain[1] - domain[0]),
  );

export const linear = ScaleFactory(
  (input, minscale, maxscale, minval, maxval, ratio) => {
    const res = minscale + (ratio * (input - minval));
    if (res === Infinity) return maxscale;
    if (res === -Infinity) return minscale;
    if (isNaN(res)) return minscale;
    return res;
  },
);
