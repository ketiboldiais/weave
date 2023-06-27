import { AngleUnit } from "./angle.js";
import { cos, pi, sin, toRadians, unsafe } from "./aux.js";
import { Base } from "./base.js";
import { colorable } from "./colorable.js";
import { Angle, angle, FigNode, linear } from "./index.js";
import { scopable } from "./scopable.js";
import { typed } from "./typed.js";

const ARC = typed(colorable(scopable(Base)));

export class Arc extends ARC {
  startAngle: Angle;
  endAngle: Angle;
  radius: number;
  constructor(startAngle: Angle, endAngle: Angle) {
    super();
    this.type = "arc";
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.radius = 1;
  }
  d() {
    const sp = this.space();
    const x = sp.scaleOf("x");
    const y = sp.scaleOf("y");
    const xlen = sp.xmax() - sp.xmin();
    const r = linear(
      [0, xlen / 4],
      [0, sp.boxed("width") / 2],
    );
    const mx = x(cos(this.startAngle.rads()));
    const my = y(sin(this.startAngle.rads()));
    const ax = r(this.radius / 2);
    const ay = r(this.radius / 2);
    const ex = x(cos(this.endAngle.rads()));
    const ey = y(sin(this.endAngle.rads()));
    let laf = this.endAngle.value <= 180 ? 0 : 1;
    let sweep = 0;
    return `M${mx},${my} A${ax},${ay} 0 ${laf} ${sweep} ${ex} ${ey}`;
  }
}

/**
 * Creates a new arc.
 * @param endAngle - The ending angle of the arc.
 * @param startAngle - The starting angle of the arc.
 */
export const arc = (endAngle?: Angle, startAngle?: Angle) => {
  const s = startAngle ? startAngle : angle(0, "deg");
  const e = endAngle ? endAngle : angle(90, "deg");
  return new Arc(s, e);
};

export const isArc = (node: FigNode): node is Arc => (
  !unsafe(node) && node.isType("arc")
);

export const arclen = (
  angle: number,
  unit: AngleUnit,
  radius: number,
) => {
  return radius * (unit === "deg" ? toRadians(angle) : angle);
};
