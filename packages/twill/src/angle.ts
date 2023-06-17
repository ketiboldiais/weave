import { arrowDef, FigNode, line, LineNode, Space, Vector, vector } from ".";
import { unsafe } from "./aux";
import { colorable } from "./colorable";
import { typed } from "./typed";

const toRadians = (degrees: number) => (degrees * (Math.PI / 180));
const toDegrees = (radians: number) => (radians * (180 / Math.PI));
const round = (value: number, to: number = 2) => {
  const cap = 10 ** (Math.abs(Math.floor(to)));
  return Math.round((value + Number.EPSILON) * cap) / cap;
};

class Angle {
  value: number;
  unit: 'degrees'|'radians';
  constructor(value:number) {
    this.value=value;
    this.unit='radians';
  }
}