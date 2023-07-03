export class BNode<T> {
  data: T | null;
  private R: () => BNode<T>;
  private L: () => BNode<T>;
  constructor(data: T | null) {
    this.data = data;
    this.R = () => BNode.none();
    this.L = () => BNode.none();
  }
  /**
   * Returns a copy of this bnode.
   */
  copy() {
    const out = new BNode(this.data);
    const left = this.L();
    const right = this.R();
    out.L = () => left;
    out.R = () => right;
    return out;
  }
  /**
   * Flattens this bnode.
   */
  flatten(): BNode<T> | T {
    return this.data === null ? BNode.none<T>() : this.data;
  }
  map<K>(callback: (data: T) => K) {
    if (this.data) {
      return BNode.some<K>(callback(this.data));
    } else return BNode.none<K>();
  }
  /**
   * Sets the value of this bnode.
   */
  set value(data: T) {
    this.data = data;
  }
  do<K>(f: (d: T) => K) {
    if (this.data !== null) {
      f(this.data);
    }
    return this;
  }
  isSomething() {
    return this.data !== null;
  }
  isNothing() {
    return this.data === null;
  }
  onRight(callback: (rightNode: BNode<T>) => void) {
    const right = this.R();
    if (right.isNothing()) return this;
    callback(right);
    return this;
  }
  onLeft(callback: (leftNode: BNode<T>) => void) {
    const left = this.L();
    if (left.isNothing()) return this;
    callback(left);
    return this;
  }
  get right() {
    return this.R();
  }
  set right(node: BNode<T>) {
    this.R = () => node;
  }
  get left() {
    return this.L();
  }
  set left(node: BNode<T>) {
    this.L = () => node;
  }
  static none<T>() {
    return new BNode<T>(null);
  }
  static some<T>(data: T) {
    return new BNode(data);
  }
}

export const bnode = <T>(data?: T) => {
  return data === undefined ? BNode.none<T>() : BNode.some<T>(data);
};
