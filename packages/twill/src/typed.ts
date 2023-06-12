import { And, Axiom, NodeType } from "./index.js";
import { uid } from "./index.js";

export interface Typed {
  name(value: string): this;
  label: string;
  copyTypes(node: Typed): this;
  /** The type name for this renderable node. */
  type: NodeType;
  /**
   * Sets the {@link Typed.type|type} for this
   * renderable node. Once set, this value
   * cannot be changed.
   */
  typed(name: NodeType): this;

  /** The node’s unique id. */
  id: string;

  /**
   * Sets the node’s id.
   * This must be a unique value.
   */
  uid(value: string): this;

  /**
   * The node’s class name.
   */
  className?: string;

  /**
   * Sets the node’s class name.
   */
  classed(value: string): this;

  /**
   * Returns the node’s class name.
   * Defaults to:
   *
   * ~~~
   * `weave-${typename}`
   * ~~~
   *
   * where `typename` is the node’s named {@link Typed.type}.
   */
  klasse(): string;
  isType(type: NodeType): boolean;
}

export function typed<Klass extends Axiom>(
  nodetype: Klass
): And<Klass, Typed> {
  return class extends nodetype {
    className?: string;
    type: NodeType = "unknown";
    id: string = uid(5);
    copyTypes(node: Typed) {
      this.className = node.className;
      this.id = node.id;
      return this;
    }
    isType(type: NodeType) {
      return this.type === type;
    }
    typed(name: NodeType) {
      if (this.type === "unknown") {
        this.type = name;
      }
      return this;
    }
    uid(value: string) {
      this.id = value;
      return this;
    }
    classed(value: string) {
      this.className = value;
      return this;
    }

    klasse() {
      const type = this.type;
      return `weave-${type}`;
    }
    label: string = "";
    name(value: string) {
      this.label = value;
      return this;
    }
  };
}
