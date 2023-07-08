import { typed } from "./typed.js";
import { colorable } from "./colorable.js";
import { compile, engine } from "@weave/twine";
import { unsafe } from "./aux.js";
import { line, lineRadial } from "d3-shape";
import { FigNode, L, path, Plottable, trail } from "./index.js";
import { scopable } from "./scopable.js";
import { Base } from "./base.js";
import { Right } from "@weave/twine";
import type { RVal } from "@weave/twine";
import { interpolator } from "@weave/math";

const PLOT_BASE = scopable(typed(colorable(Base)));

export class Plot extends PLOT_BASE {
  fn: Right<(...args: any[]) => RVal> | null;
  samples: number = 300;
  children: Plottable[] = [];
  system: "cartesian" | "polar" | "contour-3D" = "cartesian";
  sys(of: "cartesian" | "polar" | "contour-3D") {
    this.system = of;
    return this;
  }
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
    this.type = "plot";
    const f = compile(engine().parse("fn " + fn + ";"));
    if (f.isRight()) {
      this.fn = f;
    } else {
      this.fn = null;
    }
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
  private radialPath(): string {
    let out = "";
    const f = this.fn;
    if (f === null) return out;
    const space = this.space();
    const xs = space.scaleOf("x");
    const ys = space.scaleOf("y");
    const d = 2;
    const rx = xs(space.amplitude("x") / d) / 2;
    const ry = ys(space.amplitude("y") / d) / 2;
    const r = Math.min(rx, ry);
    const domain_max = 2 * Math.PI;
    const rscale = interpolator([0, 2], [0, xs(r)]);
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
    return out;
  }

  private contour3D() {
  }

  shift() {
    if (this.system === "cartesian") {
      return "";
    } else {
      const space = this.space();
      const vw = space.vw / 2;
      const vh = space.vh / 2;
      return `translate(${vw},${vh})`;
    }
  }

  private linearPath(): string {
    let out = "";
    const f = this.fn;
    if (f === null) return out;
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
    // const ps = trail(dataset).d();
    const p = line()
      .y((d) => ys(d[1]))
      .defined((d) => !isNaN(d[1]))
      .x((d) => xs(d[0]))(dataset);
    out = p === null ? "" : p;
    return out;
  }

  path(): string {
    const fn = this.fn;
    if (fn === null) return "";
    switch (this.system) {
      case "cartesian":
        return this.linearPath();
      case "polar":
        return this.radialPath();
      default:
        return "";
    }
  }
}

export type CurveData = {
  d: string;
  t: string;
};

/**
 * Returns a new function plot in 𝐑².
 * Functions must be written in the syntax:
 *
 * ~~~bash
 * <var> '(' <var> ')' '=' <expression>
 * ~~~
 *
 * @example
 * ~~~
 * plot('f(x) = x^2')
 * plot('h(y) = y^2')
 * ~~~
 */
export const plot = (fn: string) => {
  return new Plot(fn);
};

/**
 * Returns a new polar plot in 𝐑².
 * Functions must be written in the syntax:
 *
 * ~~~bash
 * <var> '(' <var> ')' '=' <expression>
 * ~~~
 *
 * @example
 * ~~~
 * plot('s(t) = cos(t) * sin(t)')
 * plot('r(x) = cos(2x) + sin(2x)')
 * ~~~
 */
export const polar = (fn: string) => {
  return new Plot(fn).sys("polar");
};

export const isPlot = (node: FigNode): node is Plot => {
  if (unsafe(node)) return false;
  return node.type === "plot";
};
