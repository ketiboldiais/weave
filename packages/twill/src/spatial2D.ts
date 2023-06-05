import { And, Axiom } from "./index.js";
import { Vector } from "./vector.js";

export interface Spatial2D {
  x: number;
  y: number;
  dy(value: number): this;
  dx(value: number): this;
  vector: () => Vector;
  pos(v: Vector): this;
}

export function spatial2D<NodeClass extends Axiom>(
  klass: NodeClass,
): And<NodeClass, Spatial2D> {
  return class extends klass {
    x: number = 0;
    dx(value: number) {
      this.x = this.x + value;
      this.vector = () => new Vector([this.x, this.y]);
      return this;
    }
    y: number = 0;
    dy(value: number) {
      this.y = this.y + value;
      this.vector = () => new Vector([this.x, this.y]);
      return this;
    }
    vector: () => Vector = () => new Vector([this.x, this.y]);
    pos(v: Vector) {
      this.vector = () => v;
      return this;
    }
  };
}
