import { typed } from "./mixins/typed.js";
import { colorable } from "./mixins/colorable.js";
import { compile, engine } from "@weave/twine";
import { unsafe } from "./aux.js";
import { FigNode, segment } from "./index.js";
import { scopable } from "./mixins/scopable.js";
import { Base } from "./base.js";
import { Right } from "@weave/twine";
import type { RVal } from "@weave/twine";

const PLOT_BASE = scopable(typed(colorable(Base)));

export class Plot extends PLOT_BASE {
  fn: Right<(...args: any[]) => RVal> | null;
  samples: number = 300;
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

  path(): string {
    let out = "";
    const f = this.fn;
    if (f === null) return out;
    const space = this.space();
    const xmin = space.xmin();
    const xmax = space.xmax();
    const ymin = space.ymin();
    const ymax = space.ymax();
    const xs = space.scaleOf("x");
    const ys = space.scaleOf("y");
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
    const d = segment(dataset).x((d) => xs(d[0])).y((d) => ys(d[1])).def((d) =>
      !isNaN(d[1])
    );
    return d.path().d(true);
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

export const isPlot = (node: FigNode): node is Plot => {
  if (unsafe(node)) return false;
  return node.type === "plot";
};
