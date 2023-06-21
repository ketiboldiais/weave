import { typed } from "./typed.js";
import { colorable } from "./colorable.js";
import { compile, engine } from "@weave/twine";
import { safer, unsafe } from "./aux.js";
import { line, lineRadial } from "d3-shape";
import { FigNode, Plottable } from "./node.types.js";
import { scopable } from "./scopable.js";
import { Base } from "./base.js";
import { Right } from "@weave/twine";
import type { RVal } from "@weave/twine";
import { linearScale } from "./space.js";
import { scaleLinear, scaleRadial } from "d3";

const PLOT_BASE = scopable(typed(colorable(Base)));

export class Plot extends PLOT_BASE {
  fn: string;
  samples: number = 300;
  children: Plottable[] = [];
  system: "cartesian" | "polar" = "cartesian";
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
    this.type = "plot";
  }
  dom: [number, number] = [-5, 5];
  domain(interval: [number, number]) {
    this.dom = interval;
    return this;
  }
  ran: [number, number] = [-5, 5];
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
  private radialPath(f: Right<(...args: any[]) => RVal>): CurveData {
    let out = "";
    const space = this.space();
    const xs = space.scaleOf("x");
    const max = (space.xmax() - space.xmin()) / 2;
    const rscale = scaleLinear()
      .domain([0, max])
      .range([0, space.boxed("width")]);
    const domain_max = 2 * Math.PI;
    let points: [number, number][] = [];
    for (let i = 0; i < domain_max; i += 0.01) {
      const x = i;
      const y = f.map((n: any) => (n(x))).unwrap();
      if (typeof y !== "number") continue;
      points.push([x, y]);
    }
    const str = lineRadial()
      .radius((d) => rscale(d[1]))
      .angle((d) => -d[0] + Math.PI / 2)(points);
    if (str !== null) out = str;
    const t = `translate(${xs(0)},${xs(0)})`;
    return { d: out, t };
  }

  private linearPath(f: Right<(...args: any[]) => RVal>): CurveData {
    let out = "";
    const space = this.space();
    const xmin = space.xmin();
    const xmax = space.xmax();
    const ymin = space.ymin();
    const ymax = space.ymax();
    const [xs, ys] = this.xyScales();
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
    return { d: out, t: "" };
  }

  path(): CurveData {
    const fn = this.fn;
    const f = compile(engine().parse("fn " + fn + ";"));
    if (f.isLeft()) return { d: "", t: "" };
    if (this.system === "cartesian") {
      return this.linearPath(f);
    }
    if (this.system === "polar") {
      return this.radialPath(f);
    }
    return { d: "", t: "" };
  }
}

export type CurveData = {
  d: string;
  t: string;
};

export const plot = (fn: string) => {
  return new Plot(fn);
};

export const isPlot = (node: FigNode): node is Plot => {
  if (unsafe(node)) return false;
  return node.type === "plot";
};
