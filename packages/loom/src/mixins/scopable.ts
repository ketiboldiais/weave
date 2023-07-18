import { Id } from "../aux.js";
import {
  And,
  arrowDef,
  Axiom,
  CoordSpace,
  Line,
  line,
  Referable,
  space,
} from "../index.js";

export interface Scopable {
  /**
   * This node's enscoping space.
   */
  space: () => CoordSpace;
  /**
   * Sets this node˚s enscoping space.
   */
  scope(space: CoordSpace): this;
}

export function scopable<NodeClass extends Axiom>(
  nodetype: NodeClass,
): And<NodeClass, Scopable> {
  return class extends nodetype {
    space: () => CoordSpace = () => space();
    scope(space: CoordSpace) {
      this.space = () => space;
      return this;
    }
  };
}

export interface Definable {
  definitions: Referable[];
  defineArrow(n: Line): this;
  define(node: Referable): this;
  space: CoordSpace;
  gridlines: Line[];
  grid(on: "x" | "y" | "xy", callback: (line: Line) => Line): this;
  context(space: CoordSpace): this;
}

export function definable<NodeClass extends Axiom>(
  nodetype: NodeClass,
): And<NodeClass, Definable> {
  return class extends nodetype {
    gridlines: Line[] = [];
    definitions: Referable[] = [];
    space: CoordSpace = space();
    context(space: CoordSpace) {
      this.space = space;
      return this;
    }
    defineArrow(n: Line) {
      this.define(arrowDef().uid(n.id).copyColors(n));
      return this;
    }
    /**
     * Inserts the provided {@link Referable} node
     * in the {@link Space.definitions}.
     */
    define(node: Referable) {
      this.definitions.push(node);
      return this;
    }
    grid(on: "x" | "y" | "xy", callback: (line: Line) => Line = Id) {
      const xmin = this.space.domainMin;
      const xmax = this.space.domainMax;
      const ymin = this.space.rangeMin;
      const ymax = this.space.rangeMax;
      const xscale = this.space.dscale();
      const yscale = this.space.rscale();
      if (on === "xy" || on === "x") {
        const xi = Math.floor(xmin);
        const xf = Math.floor(xmax);
        for (let i = xi; i <= xf; i++) {
          let gridline = line([i, ymin], [i, ymax]);
          if (callback) {
            gridline = callback(gridline);
          }
          gridline.x1 = xscale(gridline.x1);
          gridline.x2 = gridline.x1;
          gridline.y1 = yscale(gridline.y1);
          gridline.y2 = yscale(gridline.y2);
          this.gridlines.push(gridline);
        }
      }
      if (on === "xy" || on === "y") {
        const yi = Math.floor(ymin);
        const yf = Math.floor(ymax);
        for (let j = yi; j <= yf; j++) {
          let gridline = line([xmin, j], [xmax, j]);
          if (callback) {
            gridline = callback(gridline);
          }
          gridline.x1 = xscale(gridline.x1);
          gridline.x2 = xscale(gridline.x2);
          gridline.y1 = yscale(gridline.y1);
          gridline.y2 = gridline.y1;
          this.gridlines.push(gridline);
        }
      }
      return this;
    }
  };
}
