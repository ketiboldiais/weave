import type { N2, N3 } from "../index.js";
import { p3 } from "../index.js";

export type CName = "M" | "A" | "L" | "H" | "V" | "T" | "S" | "Z" | "Q" | "C";

/**
 * A PC1 (path command 1) is a path command
 * with only one argument, the endpoint:
 * ~~~ts
 * [x,y,z]
 * ~~~
 * where x, y, and z are numbers.
 */
export type PC1 = [CName, N3];

// deno-fmt-ignore
const command1 = (
  prefix: CName,
) => (x: number, y: number, z: number=0): PC1 => [prefix, [x, y, z]];

export const M = command1("M");
export const L = command1("L");
export const H = command1("H");
export const V = command1("V");
export const Z = command1("Z");
export const S = command1("S");
export const T = command1("T");

export type QBC = ["Q", N3, N3];
export const Q = (ctrl: N2 | N3, end: N2 | N3): QBC => ["Q", p3(end), p3(ctrl)];

export type CBC = ["C", N3, N3, N3];
export const C = (startControl: N2 | N3, endControl: N2 | N3, end: N2 | N3): CBC => [
  "C",
  p3(end),
  p3(startControl),
  p3(endControl),
];

export type AC = ["A", N3, N3, number, 0 | 1, 0 | 1];
export const A = (
  rxry: N2 | N3,
  rotation: number,
  largeArcFlag: 0 | 1,
  sweepFlag: 0 | 1,
  end: N2 | N3,
): AC => ["A", p3(end), p3(rxry), rotation, largeArcFlag, sweepFlag];

/**
 * A path command (PC) is a tuple with the signature
 * ~~~ts
 * [command, [x,y,z], ...((number[])[])]
 * ~~~
 * E.g.,
 * ~~~ts
 * ['A', [1,2,3], [3], [4]]
 * ~~~
 * The first component is always the command’s prefix, the
 * and second component is always the endpoint. The remaining
 * components are command-specific.
 */
export type PC = PC1 | QBC | CBC | AC;

/**
 * Returns the command type of this command.
 */
export const ctype = (command: PC) => command[0];

/**
 * Returns the endpoint of the given path command.
 */
export const endpoint = (command: PC): N3 => [
  command[1] ? command[1][0] : 0,
  command[1] ? command[1][1] : 0,
  command[1] ? command[1][2] : 0,
];

/**
 * Returns the control point of the given Q-command.
 */
export const qCtrl = (command: CBC): N3 => [
  command[2] ? command[2][0] : 0,
  command[2] ? command[2][1] : 0,
  command[2] ? command[2][2] : 0,
];

/**
 * Returns the start control point of the
 * given C-command.
 */
export const cCtrl1 = (command: CBC): N3 => [
  command[2] ? command[2][0] : 0,
  command[2] ? command[2][1] : 0,
  command[2] ? command[2][2] : 0,
];

/**
 * Returns the end control point of the
 * given C-command.
 */
export const cCtrl2 = (command: CBC): N3 => [
  command[3] ? command[3][0] : 0,
  command[3] ? command[3][1] : 0,
  command[3] ? command[3][2] : 0,
];

/**
 * Returns the major and minor radii
 * of the given A-command.
 */
export const aRxRy = (command: AC): N3 => [
  command[2] ? command[2][0] : 0,
  command[2] ? command[2][1] : 0,
  command[2] ? command[2][2] : 0,
];

/**
 * Returns the rotation value of the
 * given A-command.
 */
export const aRotation = (command: AC) => command[3] ?? 0;

/**
 * Returns the large-arc flag of the given A-command.
 */
export const aArcFlag = (command: AC) => command[4] ?? 0;

/**
 * Returns the sweep flag of the given A-command.
 */
export const aSweep =(command: AC) => command[5] ?? 0;

export class Path {
  points: (PC)[] = [];
  cursor: N3;
  constructor(x: number, y: number, z: number) {
    this.cursor = [x, y, z];
  }
  private add1(command: PC1) {
    const [x1, y1, z1] = this.cursor;
    const [x2, y2, z2] = endpoint(command);
    const x = x1 + x2;
    const y = y1 + y2;
    const z = z1 + z2;
    const newPosition: N3 = [x, y, z];
    this.points.push([command[0], newPosition]);
    this.cursor = newPosition;
    return this;
  }
  m(x: number, y: number, z: number = 0) {
    return this.add1(M(x, y, z));
  }
  l(x: number, y: number, z: number = 0) {
    return this.add1(L(x, y, z));
  }
  h(x: number, y: number, z: number = 0) {
    return this.add1(H(x, y, z));
  }
  v(x: number, y: number, z: number = 0) {
    return this.add1(V(x, y, z));
  }
  z(x: number, y: number, z: number = 0) {
    return this.add1(Z(x, y, z));
  }
  s(x: number, y: number, z: number = 0) {
    return this.add1(S(x, y, z));
  }
  t(x: number, y: number, z: number = 0) {
    return this.add1(T(x, y, z));
  }
}

export const path = (x: number, y: number, z: number = 0) => (
  new Path(x, y, z)
);

