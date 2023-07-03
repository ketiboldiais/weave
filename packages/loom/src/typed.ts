import { And, Axiom, NodeType } from "./index.js";
import { uid } from "./index.js";

export interface Tagged {
  /** The node’s unique id. */
  id: string | number;
  /**
   * Sets the node’s id.
   * This must be a unique value.
   */
  uid(value: string|number): this;
}

export function tagged<Klass extends Axiom>(
  nodetype: Klass,
): And<Klass, Tagged> {
  return class extends nodetype {
    id: string | number = uid(5);
    uid(value: string) {
      this.id = value;
      return this;
    }
  };
}

export interface Typed {
  /** The type name for this renderable node. */
  type: NodeType;
  /**
   * Sets the {@link Typed.type|type} for this
   * renderable node. Once set, this value
   * cannot be changed.
   */
  typed(name: NodeType): this;

  /**
   * Sets the node’s id.
   * This must be a unique value.
   */
  isType(type: NodeType): boolean;
}

export function typed<Klass extends Axiom>(
  nodetype: Klass,
): And<Klass, Typed> {
  return class extends nodetype {
    type: NodeType = "unknown";
    isType(type: NodeType) {
      return this.type === type;
    }
    typed(name: NodeType) {
      if (this.type === "unknown") {
        this.type = name;
      }
      return this;
    }
    klasse() {
      const type = this.type;
      return `weave-${type}`;
    }
  };
}
