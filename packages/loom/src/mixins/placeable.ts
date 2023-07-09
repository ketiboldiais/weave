import { v3, Vector } from "@weave/math";
import { And, Axiom, Space2D } from "../index.js";

export interface Movable {
  /** The movable’s origin. */
  O: Vector;

	/** Sets the movable’s origin (the z-coordinate defaulting to 0). */
  at(x: number, y: number, z?: number): this;
	
	get x(): number;
	set x(value:number);
	get y(): number;
	set y(value:number);
	get z(): number;
	set z(value:number);
}

export function movable<NodeClass extends Axiom>(
  nodetype: NodeClass,
): And<NodeClass, Movable> {
  return class extends nodetype {
    O: Vector = v3(0, 0, 1);
    at(x: number, y: number, z: number = 1) {
      this.O.x = x;
      this.O.y = y;
      this.O.z = z;
      return this;
    }
		get z() {
			return this.O.z;
		}
		set z(value:number) {
			this.O.z = value;
		}
		get x() {
			return this.O.x;
		}
		set x(value:number) {
			this.O.x = value;
		}
		get y() {
			return this.O.y;
		}
		set y(value:number) {
			this.O.y = value;
		}
  };
}
