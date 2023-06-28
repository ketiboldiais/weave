import {
  And,
  Axiom,
  Matrix,
  matrix,
  Space2D,
  Vector,
  vector,
} from "./index.js";

export interface Scopable {
  space: () => Space2D;
  scope(space: Space2D): this;
  tmx: Matrix | null;
  transform(callback: (matrix: Matrix) => Matrix): this;
  get transformation(): string;
  get transformOrigin(): string;
}

export function scopable<NodeClass extends Axiom>(
  nodetype: NodeClass,
): And<NodeClass, Scopable> {
  return class extends nodetype {
    space: () => Space2D = () => new Space2D();
    tmx: Matrix | null = null;
    o: Vector | null = null;
    get transformOrigin() {
      if (this.o) {
        const x = this.o.x;
        const y = this.o.y;
        return `${x} ${y}`;
      }
      return "";
    }
    get transformation() {
      if (this.tmx === null) return "";
      const arr = this.tmx.array();
      const e1 = arr[0] ? arr[0] : [0, 0, 0];
      const e2 = arr[1] ? arr[1] : [0, 0, 0];
      const elems = [e1, e2];
      let out = "matrix(";
      for (let i = 0; i < elems.length; i++) {
        const nums = elems[i];
        for (let j = 0; j < nums.length; j++) {
          const n = nums[j];
          out += `${n} `;
        }
      }
      out = out.substring(0, out.length - 1);
      out += ")";
      return out;
    }
    scope(space: Space2D) {
      this.space = () => space;
      if (this.tmx) {
        const xs = space.scaleOf("x");
        const ys = space.scaleOf("y");
        this.o = vector(xs(0), ys(0));
      }
      return this;
    }
    transform(callback: (matrix: Matrix) => Matrix | (number[])[]) {
      if (this.tmx) {
        const mtx = callback(this.tmx);
        if (Array.isArray(mtx)) {
          this.tmx = matrix(mtx);
        } else this.tmx = mtx;
      } else {
        const mtx = callback(matrix([
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 1],
        ]));
        if (Array.isArray(mtx)) {
          this.tmx = matrix(mtx);
        } else this.tmx = mtx;
      }
      return this;
    }
  };
}
