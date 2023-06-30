import { Matrix, ScaleFn, v2 } from "./index.js";

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
