import { typed } from "./typed.js";
import { colorable } from "./colorable.js";
import { Space } from "./space.js";
import { compile, engine } from "@weave/twine";
import { safer, tuple } from "./aux.js";
import { line } from "d3-shape";

export class Plot {
  fn: string;
  samples: number = 300;
  sampled(n: number) {
    this.samples = n;
    return this;
  }
  constructor(fn: string) {
    this.fn = fn;
  }
  private space: () => Space = () => new Space();
  scope(space: Space) {
    this.space = () => space;
    return this;
  }
  dom?: [number, number];
  domain(interval: [number, number]) {
    this.dom = interval;
    return this;
  }
  ran?: [number, number];
  range(interval: [number, number]) {
    this.ran = interval;
    return this;
  }

  path() {
    const space = this.space();
    const domain = safer(this.dom, space.dom);
    const range = safer(this.ran, space.ran);
    const xmin = safer(domain[0], space.xmin());
    const xmax = safer(domain[1], space.xmax());
    const ymin = safer(range[0], space.ymin());
    const ymax = safer(range[1], space.ymax());
    const width = space.boxed("width");
    const height = space.boxed("height");
    const xdomain = tuple(0, width);
    const ydomain = tuple(height, 0);
    const scale = space.scale();
    const ys = scale().domain(range).range(ydomain);
    const xs = scale().domain(domain).range(xdomain);
    const out = { curve: "" };
    const fn = this.fn;
    const f = compile(engine().parse("fn " + fn + ";"));
    if (f.isLeft()) return out;
    const samples = this.samples;
    const dataset: [number, number][] = [];
    for (let i = -samples; i < samples; i++) {
      const x = (i / samples) * xmax;
      const y = f.map((n:any) => n(x)).unwrap();
      if (typeof y !== "number") continue;
      const point: [number, number] = [x, y];
      if (isNaN(y) || y < ymin || ymax < y) point[0] = NaN;
      if (x < xmin || xmax < x) continue;
      else dataset.push(point);
    }
    const p = line()
      .y((d) => ys(d[1]))
      .defined((d) => !isNaN(d[1]))
      .x((d) => xs(d[0]))(dataset);
    out.curve = p === null ? "" : p;
    return out;
  }
}

export const plot = (fn: string) => {
  const fig = typed(colorable(Plot));
  return new fig(fn).typed("plot");
};

export type PlotNode = ReturnType<typeof plot>;
