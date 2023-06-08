import { And, Axiom } from "./index.js";

export interface Spatial2D {
  x: number;
  y: number;
  dy(value: number): this;
  dx(value: number): this;
  at(coord: [number, number]): this;
  position(option: "x" | "y", value: number): this;
}

export function spatial2D<NodeClass extends Axiom>(
  klass: NodeClass,
): And<NodeClass, Spatial2D> {
  return class extends klass {
    x: number = 0;
    position(option: "x" | "y", value: number) {
      if (option === "x") {
        this.x = value;
      } else {
        this.y = value;
      }
      return this;
    }
    at(coord: [number, number]) {
      this.x = coord[0];
      this.y = coord[1];
      return this;
    }
    dx(value: number) {
      this.x = this.x + value;
      return this;
    }
    y: number = 0;
    dy(value: number) {
      this.y = this.y + value;
      return this;
    }
  };
}
