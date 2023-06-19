import { typed } from "./typed.js";
import { colorable } from "./colorable.js";
import { compile, engine } from "@weave/twine";
import { safer, unsafe } from "./aux.js";
import { line } from "d3-shape";
import { FigNode, Plottable } from "./node.types.js";
import {scopable} from './scopable.js';
import {Base} from './base.js';

const PLOT_BASE = scopable(typed(colorable(Base)));

export class Plot extends PLOT_BASE {
  fn: string;
  samples: number = 300;
  children: Plottable[] = [];
  and(child: Plottable) {
    this.children.push(child.scope(this));
    return this;
  }
  sampled(n: number) {
    this.samples = n;
    return this;
  }
  constructor(fn: string) {
    super();
    this.fn = fn;
    this.type = 'plot';
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
  xyScales() {
    const space = this.space();
    const ys = space.scaleOf("y");
    const xs = space.scaleOf("x");
    return [xs, ys];
  }

  path() {
    const space = this.space();
    const domain = safer(this.dom, space.dom);
    const range = safer(this.ran, space.ran);
    const xmin = safer(domain[0], space.xmin());
    const xmax = safer(domain[1], space.xmax());
    const ymin = safer(range[0], space.ymin());
    const ymax = safer(range[1], space.ymax());
    const [xs, ys] = this.xyScales();
    let out = "";
    const fn = this.fn;
    const f = compile(engine().parse("fn " + fn + ";"));
    if (f.isLeft()) return out;
    const samples = this.samples;
    const dataset: [number, number][] = [];
    for (let i = -samples; i < samples; i++) {
      const x = (i / samples) * xmax;
      const y = f.map((n: any) => n(x)).unwrap();
      if (typeof y !== "number") continue;
      const point: [number, number] = [x, y];
      if (isNaN(y) || y < ymin || ymax < y) point[1] = NaN;
      if (x < xmin || xmax < x) continue;
      else dataset.push(point);
    }
    const p = line()
      .y((d) => ys(d[1]))
      .defined((d) => !isNaN(d[1]))
      .x((d) => xs(d[0]))(dataset);
    out = p === null ? "" : p;
    return out;
  }
}

export const plot = (fn: string) => {
  return new Plot(fn);
};

export const isPlot = (node: FigNode): node is Plot => {
  if (unsafe(node)) return false;
  return node.type === "plot";
};
