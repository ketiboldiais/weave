export class Binode<T> {
  data: T | null;
  private R: () => Binode<T>;
  private L: () => Binode<T>;
  constructor(data: T | null) {
    this.data = data;
    this.R = () => Binode.none();
    this.L = () => Binode.none();
  }
  /**
   * Returns a copy of this binode.
   */
  copy() {
    const out = new Binode(this.data);
    const left = this.L();
    const right = this.R();
    out.L = () => left;
    out.R = () => right;
    return out;
  }
  /**
   * Flattens this binode.
   */
  flatten(): Binode<T> | T {
    return this.data === null ? Binode.none<T>() : this.data;
  }
  map<K>(callback: (data: T) => K) {
    if (this.data) {
      return Binode.some<K>(callback(this.data));
    } else return Binode.none<K>();
  }
  /**
   * Sets the value of this binode.
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
  get right() {
    return this.R();
  }
  set right(node: Binode<T>) {
    this.R = () => node;
  }
  get left() {
    return this.L();
  }
  set left(node: Binode<T>) {
    this.L = () => node;
  }
  static none<T>() {
    return new Binode<T>(null);
  }
  static some<T>(data: T) {
    return new Binode(data);
  }
}

export const binode = <T>(data?: T) => {
  return data === undefined ? Binode.none<T>() : Binode.some<T>(data);
};
