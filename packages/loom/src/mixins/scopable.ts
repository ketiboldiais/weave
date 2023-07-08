import { And, Axiom, Space2D } from "../index.js";

export interface Scopable {
  /**
   * This node's enscoping space.
   */
  space: () => Space2D;
  /**
   * Sets this node˚s enscoping space.
   */
  scope(space: Space2D): this;
}

export function scopable<NodeClass extends Axiom>(
  nodetype: NodeClass,
): And<NodeClass, Scopable> {
  return class extends nodetype {
    space: () => Space2D = () => new Space2D();
    scope(space: Space2D) {
      this.space = () => space;
      return this;
    }
  };
}
