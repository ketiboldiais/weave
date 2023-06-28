import { cos, sin, toRadians, unsafe } from "./aux.js";
import { Base } from "./base.js";
import { colorable } from "./colorable";
import { FigNode, Matrix, matrix, v2, Vector } from "./index.js";
import { anglevalue } from "./parsers.js";
import { scopable } from "./scopable.js";
import { typed } from "./typed.js";

const PATH = typed(colorable(scopable(Base)));

export class Path extends PATH {
  points: ([string, Vector] | [string, Vector, Vector])[];
  constructor(origin: Vector) {
    super();
    this.points = [["M", origin]];
    this.type = "path";
  }

  transform(callback: (vector: Vector) => Vector) {
    this.points = this.points.map((d) => {
      if (d.length === 3) {
        const [a, b, c] = d;
        return [a, callback(b), callback(c)];
      } else {
        const [a, b] = d;
        return [a, callback(b)];
      }
    });
    return this;
  }
  reflectX() {
    this.transform((v) =>
      v.vxm(matrix([
        [1, 0],
        [0, -1],
      ]))
    );
    return this;
  }
  reflectY() {
    this.transform((v) =>
      v.vxm(matrix([
        [-1, 0],
        [0, 1],
      ]))
    );
    return this;
  }
  shearY(shear: number) {
    this.transform((v) =>
      v.vxm(
        matrix([
          [1, 0],
          [shear, 1],
        ]),
      )
    );
    return this;
  }
  shearX(shear: number) {
    this.transform((v) =>
      v.vxm(
        matrix([
          [1, shear],
          [0, 1],
        ]),
      )
    );
    return this;
  }
  /**
   * Scales every point along this path.
   */
  scale(x: number, y: number) {
    this.transform((v) =>
      v.vxm(matrix([
        [x, 0],
        [0, y],
      ]))
    );
    return this;
  }
  /**
   * Rotates every point along this path.
   */
  rotate(angle: number | string) {
    let a = 0;
    if (typeof angle === "string") {
      const v = anglevalue.parse(angle).result.unwrap({
        value: 0,
        unit: "rad",
      });
      a = v.unit === "deg" ? toRadians(v.value) : v.value;
    } else a = angle;
    this.transform((v) =>
      v.vxm(matrix([
        [cos(a), sin(a)],
        [-sin(a), cos(a)],
      ]))
    );
    return this;
  }
  d() {
    const space = this.space();
    const xs = space.scaleOf("x");
    const ys = space.scaleOf("y");
    const pts: string[] = [];
    for (let i = 0; i < this.points.length; i++) {
      const pt = this.points[i];
      if (pt.length === 3) {
        let [command, v1, v2] = pt;
        const x1 = xs(v1.x);
        const y1 = ys(v1.y);
        const x2 = xs(v2.x);
        const y2 = ys(v2.y);
        pts.push(`${command}${x1},${y1} ${x2},${y2}`);
        continue;
      }
      let [command, vector] = pt;
      if (command === "Z") {
        pts.push("Z");
        continue;
      }
      if (command === "H" || command === "h") {
        const x = vector.x;
        pts.push(`${command}${xs(x)}`);
      } else if (command === "V" || command === "v") {
        const y = vector.y;
        pts.push(`${command}${ys(y)}`);
      } else {
        const x = vector.x;
        const y = vector.y;
        pts.push(`${command}${xs(x)},${ys(y)}`);
      }
    }
    return pts.join(" ");
  }

  T(point: (number[]) | Vector) {
    this.push("T", Vector.from(point));
    return this;
  }

  Q(controlPoint: (number[]) | Vector, endpoint: (number[]) | Vector) {
    this.points.push(["Q", Vector.from(controlPoint), Vector.from(endpoint)]);
    return this;
  }

  B(
    startPoint: (number[]) | Vector,
    controlPoint: (number[]) | Vector,
    endPoint: (number[]) | Vector,
  ) {
    const start = Vector.from(startPoint);
    const end = Vector.from(endPoint);
    this.points.push(["M", start]);
    const mid = Vector.from(controlPoint);
    this.points.push(["Q", mid.mul(2), end]);
    return this;
  }
  /**
   * Closes this path.
   */
  Z() {
    const [_, v] = this.lastCommand();
    this.push("Z", v);
    return this;
  }
  private push(command: string, point: (number[]) | Vector) {
    this.points.push([command, Vector.from(point)]);
    return this;
  }
  private lastCommand() {
    return this.points[this.points.length - 1];
  }
  private c1(command: "V" | "H", point: number) {
    const prev = this.lastCommand();

    const [_, v] = prev;
    const pt = command === "H" ? [point, v.y] : [v.x, point];
    this.push(command, pt);

    return this;
  }
  private rc(command: string, point: Vector) {
    const prev = this.lastCommand();

    const [_, v] = prev;
    const n = v.add(point);
    this.push(command.toUpperCase(), n);

    return this;
  }
  v(point: number) {
    return this.rc("v", v2(0, point));
  }
  V(point: number) {
    return this.c1("V", point);
  }
  H(point: number) {
    return this.c1("H", point);
  }
  h(point: number) {
    return this.rc("h", v2(0, point));
  }
  l(point: (number[]) | Vector) {
    return this.rc("l", Vector.from(point));
  }
  L(point: (number[]) | Vector) {
    return this.push("L", point);
  }
}

export const path = (origin: number[] | Vector) => (
  new Path(Vector.from(origin))
);

export const isPath = (node: FigNode): node is Path => (
  !unsafe(node) && node.isType("path")
);
