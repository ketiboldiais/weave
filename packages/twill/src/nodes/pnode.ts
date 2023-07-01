import { And, Axiom } from "..";

class Box<T> {
  data: T | null;
  constructor(data: T | null) {
    this.data = data;
  }
}
export interface Dyadic<T> {
  aleft(data: Dyadic<T>): this;
  aright(data: Dyadic<T>): this;
}

export function dyadic<NodeClass extends Axiom>(
  nodetype: NodeClass,
): And<NodeClass, Dyadic<NodeClass>> {
  return class extends nodetype {
    L: (Dyadic<NodeClass>) | null = null;
    R: (Dyadic<NodeClass>) | null = null;
    aright(data: Dyadic<NodeClass>) {
      this.R = data;
      return this;
    }
    aleft(data: Dyadic<NodeClass>) {
      this.L = data;
      return this;
    }
  };
}

