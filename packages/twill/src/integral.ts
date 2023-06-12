import { typed } from "./typed.js";
import { colorable } from "./colorable.js";
import { Space } from "./space.js";
import { Coord, FigNode } from "./node.types.js";
import { Plot } from "./plot.js";
import { compile, engine } from "@weave/twine";
import { area } from "d3-shape";
import { unsafe } from "./aux.js";

export class Integral {
  bounds: [number, number];
  private space: () => Plot = () => new Plot("");
  scope(space: Plot) {
    this.space = () => space;
    return this;
  }
  constructor(bounds: [number, number]) {
    this.bounds = bounds;
  }
  samples: number = 100;
  sampled(n: number) {
    this.samples = n;
    return this;
  }
  area() {
    const plot = this.space();
    const [xs, ys] = plot.xyScales();
    if (plot.fn === "") return "";
    const space = plot.space();
    const domain = space.dom;
    const range = space.ran;
    const ymin = range[0];
    const ymax = range[1];
    const lowerBound = this.bounds[0];
    const upperBound = this.bounds[1];
    const max = domain[1];
    const dataset: Coord[] = [];
    const samples = plot.samples;
    const def = plot.fn;
    const f = compile(engine().parse("fn " + def + ";"));
    if (f.isLeft()) return "";
    for (let i = -samples; i < samples; i++) {
      const n = (i / samples) * max;
      const x1 = n;
      const x2 = n;
      const y1 = f.map((n) => n(x1)).unwrap();
      if (typeof y1 !== "number") continue;
      const y2 = 0;
      if (lowerBound < n && n < upperBound && ymin <= y1 && y1 <= ymax) {
        dataset.push({ x1, x2, y1, y2 });
      }
    }
    const A = area<Coord>()
      .defined((d) => !isNaN(d.y1) && !isNaN(d.y2))
      .x0((d) => xs(d.x1))
      .y0((d) => ys(d.y1))
      .x1((d) => xs(d.x2))
      .y1((d) => ys(d.y2))(dataset);
    if (A === null) return "";
    return A;
  }
}

export const integral = (bounds: [number, number]) => {
  const fig = typed(colorable(Integral));
  return new fig(bounds).typed("integral");
};
export type IntegralNode = ReturnType<typeof integral>;
export const isIntegral = (node: FigNode): node is IntegralNode => {
  if (unsafe(node)) return false;
  return node.type === "integral";
};