import {unsafe} from './aux.js';
import {colorable} from './colorable.js';
import {FigNode} from './node.types.js';
import {Space} from './space.js';
import {typed} from './typed.js';
import { Vector } from "./vector.js";

export const area = (radius:number) => (
  Math.PI * (radius ** 2)
)

export class Circle extends Vector {
  r: number = 5;
  dx: number = 0;
  dy: number = 0;
  space: () => Space;
  
  /**
   * Returns the diameter of this circle,
   * per its current radius.
   */
  diameter() {
    return (2 * this.r);
  }
  
  /**
   * Returns the circumference of this
   * circle, per its current radius.
   */
  circumference() {
    return (2 * Math.PI * this.r)
  }

  /**
   * Returns the area of this circle,
   * per its current radius.
   */
  area() {
    return (Math.PI) * (this.r**2)
  }
  scope(space:Space) {
    this.space = () => space;
    return this;
  }
  Dy(value: number) {
    this.dy = value;
    return this;
  }
  Dx(value: number) {
    this.dx = value;
    return this;
  }
  label: string;
  constructor(name: string) {
    super(0, 0, 0);
    this.label = name;
    this.space=()=>new Space();
  }
  radius(value: number) {
    this.r = value;
    return this;
  }
}

const CIRCLE = typed(colorable(Circle));
export const circle = (radius:number) => (
  new CIRCLE("").radius(radius).typed('circle')
)
export type CircleNode = ReturnType<typeof circle>;
export const isCircle = (node:FigNode): node is CircleNode => (
  !unsafe(node) && node.isType('circle')
)

