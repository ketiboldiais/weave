import { leaf, subtree, Tree, TreeChild } from "../index.js";
import { none, Option, some } from "./box.js";

export class BNode<T> {
  data: T | null;
  private R: Option<BNode<T>>;
  private L: Option<BNode<T>>;
  constructor(data: T | null) {
    this.data = data;
    this.R = none();
    this.L = none();
  }
  get prev() {
    if (this.L._tag === "None") {
      return new BNode<T>(null);
    } else {
      return this.L.value;
    }
  }
  get next() {
    if (this.R._tag === "None") {
      return new BNode<T>(null);
    } else {
      return this.R.value;
    }
  }
  get left() {
    if (this.L._tag === "None") {
      return new BNode<T>(null);
    } else {
      return this.L.value;
    }
  }
  get right() {
    if (this.R._tag === "None") {
      return new BNode<T>(null);
    } else {
      return this.R.value;
    }
  }
  set next(node: BNode<T>) {
    this.R = some(node);
  }
  set prev(node: BNode<T>) {
    this.L = some(node);
  }
  set right(node: BNode<T>) {
    this.R = some(node);
  }
  set left(node: BNode<T>) {
    this.L = some(node);
  }
  fignode(idfn: (data: T | null) => string | number) {
    if (this.L._tag === "None" && this.R._tag === "None") {
      return leaf(idfn(this.data));
    }
    const out = subtree(idfn(this.data));
    const nodes: TreeChild[] = [];
    if (this.L._tag !== "None") {
      nodes.push(this.L.value.fignode(idfn));
    }
    if (this.R._tag !== "None") {
      nodes.push(this.R.value.fignode(idfn));
    }
    out.nodes(nodes);
    return out;
  }
  isLeaf() {
    return this.R === null && this.L === null;
  }
  onRight(callback: (node: BNode<T>) => void) {
    if (this.R._tag === "Some") {
      callback(this.R.value);
    }
  }
  onLeft(callback: (node: BNode<T>) => void) {
    if (this.L._tag === "Some") {
      callback(this.L.value);
    }
  }
  /**
   * Returns a copy of this bnode.
   */
  copy() {
    const out = new BNode(this.data);
    const left = this.L;
    const right = this.R;
    out.L = left;
    out.R = right;
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
