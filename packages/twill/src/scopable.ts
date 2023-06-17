import { And, Axiom, Space } from "./index.js";

export interface Scopable {
  space: () => Space;
  scope(space: Space): this;
}

export function scopable<NodeClass extends Axiom>(
  nodetype: NodeClass,
): And<NodeClass, Scopable> {
  return class extends nodetype {
    space: () => Space = () => new Space();
    scope(space: Space) {
      this.space = () => space;
      return this;
    }
  };
}
