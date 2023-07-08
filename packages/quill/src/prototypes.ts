// @ts-nocheck

figure([
  line([1, 2], [3, 4]),
  line([1, 2], [3, 4]),
  line([1, 2], [3, 4]),
]).dom(-2, 2).ran(-2, 2);

figure([
  plot(`f(x) = x^2`),
  plot(`g(x) = sin x`),
  plot(`h(x) = cos x`),
]).dom(-2, 2).ran(-2, 2);

figure([
  graph({
    a: ["a", "b", "c"],
    b: ["a"],
    c: ["f", "d"],
  }),
]);

import { cos, sin, unsafe } from "../aux.js";
import { Base } from "../base.js";
import { colorable } from "../colorable.js";
import { Matrix, matrix, v2, Vector } from "@weave/math";
import { FigNode, linear } from "../index.js";
import { parseDegrees, parseRadians } from "../parsers.js";
import {
  A,
  C,
  H,
  L,
  M,
  P,
  PathCommand,
  pathScaler,
  pathStringer,
  Q,
  S,
  T,
  transformer2D,
  V,
  Z,
} from "./pathcoms.js";
import { scopable } from "../scopable.js";
import { typed } from "../typed.js";

const PATH = typed(colorable(scopable(Base)));

export class Path extends PATH {
  points: (PathCommand)[];
  cursor: Vector;
  /**
   * Generates grid lines.
   */
  grid() {
    const space = this.space();
    const xmin = space.xmin();
    const xmax = space.xmax();
    const ymin = space.ymin();
    const ymax = space.ymax();
    const out = new Path();

    const xi = Math.floor(xmin);
    const xf = Math.floor(xmax);
    for (let i = xi; i <= xf; i++) {
      out.M(i, ymin);
      out.L(i, ymax);
    }

    const yi = Math.floor(ymin);
    const yf = Math.floor(ymax);
    for (let j = yi; j <= yf; j++) {
      out.M(xmin, j);
      out.L(xmax, j);
    }
    return out;
  }
  get end() {
    if (this.points.length) {
      return Vector.from(this.points[this.points.length - 1].end);
    }
    return Vector.from([0, 0]);
  }
  get start() {
    if (this.points.length) return Vector.from(this.points[0].end);
    return Vector.from([0, 0]);
  }
  constructor(initX?: number, initY?: number) {
    super();
    const defined = initX !== undefined && initY !== undefined;
    this.points = defined ? [M(initX, initY)] : [];
    this.cursor = defined ? v2(initX, initY) : v2(0, 0);
    this.type = "path";
  }
  concat(pathCommands: (PathCommand | Path)[]) {
    if (pathCommands.length === 0) return this;
    const pcs = pathCommands
      .map((p) => p instanceof Path ? p.points : p)
      .flat();
    pcs.forEach((p) => this.points.push(p));
    this.cursor = Vector.from(pcs[pcs.length - 1].end);
    return this;
  }
  /**
   * Clears all points on this path currently.
   */
  clear() {
    this.points = [];
    this.cursor = v2(0, 0);
    return this;
  }

  private tfm(matrix: Matrix) {
    const t = transformer2D(matrix);
    this.points = this.points.map((p) => t(p));
    this.cursor = this.cursor.vxm(matrix);
    return this;
  }

  /**
   * Rotates this path by the given angle.
   * If a number is passed for the angle
   * value, the angle unit is assumed to be
   * radians. If a string is passed, Weave’s
   * combinators will attempt to parse an angle,
   * defaulting to 0 in failure.
   */
  rotate(angle: string | number) {
    const theta = typeof angle === "string" ? parseRadians(angle) : angle;
    return this.tfm(matrix([
      [cos(theta), sin(theta)],
      [-sin(theta), cos(theta)],
    ]));
  }

  /**
   * Shears this path along the y-axis
   * by the given value.
   */
  shearY(value: number) {
    return this.tfm(
      matrix([
        [1, 0],
        [value, 1],
      ]),
    );
  }

  /**
   * Shears this path along the x-axis
   * by the given value.
   */
  shearX(value: number) {
    return this.tfm(matrix([
      [1, value],
      [0, 1],
    ]));
  }

  /**
   * Reflects this path along its y-axis.
   */
  reflectY() {
    return this.tfm(
      matrix([
        [-1, 0],
        [0, 1],
      ]),
    );
  }

  /**
   * Reflects this path along its x-axis.
   */
  reflectX() {
    return this.tfm(
      matrix([
        [1, 0],
        [0, -1],
      ]),
    );
  }

  /**
   * Scales this path by the given value.
   * If a single value is passed or both
   * `x` and `y` are equal, scales
   * uniformly. Otherwise, `x` will
   * scale the path along the x-axis,
   * and `y` along the y-axis.
   *
   * @param x - The x-scale factor.
   * @param y - The y-scale factor.
   */
  scale(x: number, y: number = x) {
    return this.tfm(
      matrix([
        [x, 0],
        [0, y],
      ]),
    );
  }

  /**
   * Returns this path’s string.
   */
  d() {
    const space = this.space();
    const xs = space.scaleOf("x");
    const ys = space.scaleOf("y");
    const scaler = pathScaler(xs, ys);
    const xmax = (space.xmax() - space.xmin()) / 2;
    const ymax = (space.ymax() - space.ymin()) / 2;
    const rxs = linear([0, xmax], [0, space.vw / 2]);
    const rys = linear([0, ymax], [0, space.vh / 2]);
    return this.points.map((p) =>
      pathStringer(
        p.type === "P"
          ? P([xs(p.end[0]), ys(p.end[1])], [
            rxs((p as any).rxry[0]),
            rys((p as any).rxry[1]),
          ])
          : scaler(p),
      )
    ).join(" ");
  }
  private push(command: PathCommand) {
    this.points.push(command);
    this.cursor = Vector.from(command.end);
    return this;
  }

  /**
   * Appends an S command.
   */
  S() {
    return this.push(S(this.cursor.x, this.cursor.y));
  }

  /**
   * Appends a T command.
   */
  T() {
    return this.push(T(this.cursor.x, this.cursor.y));
  }

  /**
   * Closes this path.
   */
  Z() {
    return this.push(Z(this.cursor.x, this.cursor.y));
  }

  /**
   * Draws an ellipse.
   * @param radiusX - The width of the ellipse.
   * @param radiusY - The height of the ellipse.
   * @param center - Optionally set the center point of the ellipse.
   * If the center isn’t provided, defaults to the current cursor position.
   */
  E(radiusX: number, radiusY: number, center?: number[]) {
    const c = center !== undefined ? center : [this.cursor.x, this.cursor.y];
    return this.push(P(c, [radiusX, radiusY]));
  }

  // Relative Commands
}

/**
 * Instantiates a new Path object.
 * @param startX - An optional starting x-coordinate. Defaults to 0.
 * @param startY - An optional starting y-coordinate. Defaults to 0.
 */
export const path = (startX: number = 0, startY: number = 0) => (
  new Path(startX, startY)
);

/**
 * Bundles the provided paths into a single path.
 */
export const group = (paths: (PathCommand | Path)[]) => (
  new Path().clear().concat(paths)
);

export const isPath = (node: FigNode): node is Path => (
  !unsafe(node) && node.isType("path")
);

export const circ = (radius: number, center: number[] = [0, 0]) => (
  path(center[0], center[1]).O(radius)
);
export const rect = (
  width: number,
  height: number,
  center: number[] = [0, 0],
) => (
  path(center[0] - (width / 2), center[1] - (height / 2))
    .h(width)
    .v(height)
    .h(-width)
    .v(-height)
);

import { Matrix, v2 } from "@weave/math";
import { ScaleFn } from "../index.js";

export type CommandHandler<T> = {
  M: (command: MCommand) => T;
  L: (command: LCommand) => T;
  H: (command: HCommand) => T;
  V: (command: VCommand) => T;
  Z: (command: ZCommand) => T;
  Q: (command: QCommand) => T;
  C: (command: CCommand) => T;
  A: (command: ACommand) => T;
  S: (command: SCommand) => T;
  T: (command: TCommand) => T;
  P: (command: PCommand) => T;
};

export type PC = keyof CommandHandler<any>;

export interface PathCommand {
  end: number[];
  type: PC;
}

interface PCommand extends PathCommand {
  end: number[];
  rxry: number[];
  type: "P";
}

export const P = (
  end: number[],
  rxry: number[],
): PCommand => ({
  end,
  rxry,
  type: "P",
});

const pString = (command: PCommand) => {
  const [cx, cy] = command.end;
  const [rx, ry] = command.rxry;
  return `M${cx - rx},${cy}a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 -${
    rx * 2
  },0 Z`;
};

export interface MCommand extends PathCommand {
  type: "M";
}

export const M = (x: number, y: number): MCommand => ({
  end: [x, y],
  type: "M",
});

export interface LCommand extends PathCommand {
  type: "L";
}

export const L = (x: number, y: number): LCommand => ({
  end: [x, y],
  type: "L",
});

export interface HCommand extends PathCommand {
  type: "H";
}

export const H = (x: number, y: number): HCommand => ({
  end: [x, y],
  type: "H",
});

export interface VCommand extends PathCommand {
  type: "V";
}

export const V = (x: number, y: number): VCommand => ({
  end: [x, y],
  type: "V",
});

export interface TCommand extends PathCommand {
  type: "T";
}
export const T = (x: number, y: number): TCommand => ({
  type: "T",
  end: [x, y],
});

export interface SCommand extends PathCommand {
  type: "S";
}
export const S = (x: number, y: number): SCommand => ({
  type: "S",
  end: [x, y],
});

export interface ZCommand extends PathCommand {
  type: "Z";
}

export const Z = (x: number, y: number): ZCommand => ({
  end: [x, y],
  type: "Z",
});

export interface QCommand extends PathCommand {
  type: "Q";
  ctrl: number[];
}
export const Q = (ctrl: number[], end: number[]): QCommand => ({
  end,
  ctrl,
  type: "Q",
});

export interface CCommand extends PathCommand {
  startCtrl: number[];
  endCtrl: number[];
  type: "C";
}
export const C = (
  startCtrl: number[],
  endCtrl: number[],
  end: number[],
): CCommand => ({
  type: "C",
  startCtrl,
  endCtrl,
  end,
});

export interface ACommand extends PathCommand {
  rxry: number[];
  type: "A";
  rotation: number;
  largeArcFlag: 0 | 1;
  sweepFlag: 0 | 1;
  end: number[];
}
export const A = (
  rxry: number[],
  rotation: number,
  largeArcFlag: 0 | 1,
  sweepFlag: 0 | 1,
  end: number[],
): ACommand => ({
  rxry,
  rotation,
  largeArcFlag,
  sweepFlag,
  end,
  type: "A",
});

// deno-fmt-ignore
export const comHandler = <T>(
	handlers: CommandHandler<T>
) => (p: PathCommand) => {
	const x = p as any;
	switch (p.type) {
		case 'M': return handlers.M(x);
		case 'L': return handlers.L(x);
		case 'H': return handlers.H(x);
		case 'V': return handlers.V(x);
		case 'Z': return handlers.Z(x);
		case 'Q': return handlers.Q(x);
		case 'C': return handlers.C(x);
		case 'A': return handlers.A(x);
		case 'S': return handlers.S(x);
		case 'T': return handlers.T(x);
		case 'P': return handlers.P(x);
	}
}

export const pathStringer = comHandler({
  M: (p) => `M${p.end[0]},${p.end[1]}`,
  L: (p) => `L${p.end[0]},${p.end[1]}`,
  H: (p) => `L${p.end[0]},${p.end[1]}`,
  V: (p) => `L${p.end[0]},${p.end[1]}`,
  Z: (_) => `Z`,
  S: (_) => `S`,
  T: (_) => `T`,
  Q: (p) => `Q${p.ctrl[0]},${p.ctrl[1]} ${p.end[0]},${p.end[1]}`,
  C: (p) =>
    `C${p.startCtrl[0]},${p.startCtrl[1]} ${p.endCtrl[0]},${p.endCtrl[1]} ${
      p.end[0]
    },${p.end[1]}`,
  A: (p) =>
    `A${p.rxry[0]},${
      p.rxry[1]
    } ${p.rotation} ${p.largeArcFlag} ${p.sweepFlag} ${p.end[0]},${p.end[1]}`,
  P: pString,
});

export const pathScaler = (xscale: ScaleFn, yscale: ScaleFn) =>
  comHandler<PathCommand>({
    M: (p) => ({ ...p, end: [xscale(p.end[0]), yscale(p.end[1])] }),
    L: (p) => ({ ...p, end: [xscale(p.end[0]), yscale(p.end[1])] }),
    H: (p) => ({ ...p, end: [xscale(p.end[0]), yscale(p.end[1])] }),
    V: (p) => ({ ...p, end: [xscale(p.end[0]), yscale(p.end[1])] }),
    Z: (p) => ({ ...p, end: [xscale(p.end[0]), yscale(p.end[1])] }),
    S: (p) => ({ ...p, end: [xscale(p.end[0]), yscale(p.end[1])] }),
    T: (p) => ({ ...p, end: [xscale(p.end[0]), yscale(p.end[1])] }),
    Q: (p) => ({
      ...p,
      end: [xscale(p.end[0]), yscale(p.end[1])],
      ctrl: [xscale(p.ctrl[0]), yscale(p.ctrl[1])],
    }),
    C: (p) => ({
      ...p,
      end: [xscale(p.end[0]), yscale(p.end[1])],
      startCtrl: [xscale(p.startCtrl[0]), yscale(p.startCtrl[1])],
      endCtrl: [xscale(p.endCtrl[0]), yscale(p.endCtrl[1])],
    }),
    A: (p) => ({ ...p, end: [xscale(p.end[0]), yscale(p.end[1])] }),
    P: (p): PCommand => ({
      ...p,
      end: [xscale(p.end[0]), yscale(p.end[1])],
    }),
  });

export const transformer2D = (matrix: Matrix) =>
  comHandler<PathCommand>({
    M: (p) => ({ ...p, end: v2(p.end[0], p.end[1]).vxm(matrix).array() }),
    L: (p) => ({ ...p, end: v2(p.end[0], p.end[1]).vxm(matrix).array() }),
    H: (p) => ({ ...p, end: v2(p.end[0], p.end[1]).vxm(matrix).array() }),
    V: (p) => ({ ...p, end: v2(p.end[0], p.end[1]).vxm(matrix).array() }),
    Z: (p) => p,
    S: (p) => p,
    T: (p) => p,
    Q: (p) => ({
      ...p,
      ctrl: v2(p.ctrl[0], p.ctrl[1]).vxm(matrix).array(),
      end: v2(p.end[0], p.end[1]).vxm(matrix).array(),
    }),
    C: (p) => ({
      ...p,
      startCtrl: v2(p.startCtrl[0], p.startCtrl[1]).vxm(matrix).array(),
      endCtrl: v2(p.endCtrl[0], p.endCtrl[1]).vxm(matrix).array(),
      end: v2(p.end[0], p.end[1]).vxm(matrix).array(),
    }),
    A: (p): ACommand => ({
      ...p,
      end: v2(p.end[0], p.end[1]).vxm(matrix).array(),
    }),
    P: (p): PCommand => ({
      ...p,
      end: v2(p.end[0], p.end[1]).vxm(matrix).array(),
      rxry: v2(p.rxry[0], p.rxry[1]).vxm(matrix).array(),
    }),
  });

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
  