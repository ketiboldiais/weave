// @ts-nocheck

import { BNode, bnode } from "./nodes/bnode.js";



export class LinkedList<T> {
  private head: BNode<T> | null;
  private tail: BNode<T> | null;
  len: number;
  constructor() {
    this.head = null;
    this.tail = null;
    this.len = 0;
  }
  get length() {
    return this.len;
  }
  /**
   * Returns the last index of
   * this list.
   */
  get lastIndex() {
    const l = this.len;
    return l === 0 ? l : l - 1;
  }
  /**
   * True if this list is empty, false otherwise.
   */
  get isEmpty() {
    return this.len === 0 || this.head === null;
  }
  /**
   * @internal Ensures that indices are valid.
   */
  safeIdx(i: number) {
    return 0 <= i && i < this.len;
  }
  /** */
  private read(index: number) {
    if (!this.safeIdx(index)) {
      return bnode<T>();
    } else {
      let count = 0;
      let current = this.head;
      while (count !== index) {
        let k = current.right;
        if (k === null) break;
        current = k;
        count++;
      }
      return current;
    }
  }
  ith(index: number, fallback: T): T {
    const out = this.read(index).data;
    return out === null ? fallback : out;
  }
  item(index: number) {
    return this.read(index).data;
  }
  unshift(element: T) {
    const node = bnode(element);
    if (this.isEmpty) {
      this.head = node;
      this.tail = node;
    } else {
      this.head.left = node;
      node.right = this.head;
      this.head = node;
    }
    this.len++;
    return this;
  }
  shift() {
    if (this.isEmpty) return null;
    let previousHead = this.head;
    if (this.isUnary) {
      this.head = bnode();
      this.tail = bnode();
    } else {
      this.head = previousHead.right || bnode();
      this.head.left = bnode();
      previousHead.right = bnode();
    }
    this.len--;
    return previousHead.data;
  }
  set(element: T, at: number) {
    const node = this.read(at);
    node.value = element;
    return this;
  }
  insert(element: T, atIndex: number) {
    if (!this.safeIdx(atIndex)) {
      return this;
    }
    if (atIndex === 0) {
      return this.unshift(element);
    }
    if (this.lastIndex === atIndex) {
      return this.push(element);
    }
    const node = bnode(element);
    const before = this.read(atIndex - 1);
    const after = before.right;
    before.right = node;
    node.left = before;
    node.right = after;
    after!.left = node!;
    this.len++;
    return this;
  }
  public static from<T>(iterable: Iterable<T>) {
    return new LinkedList().append(...iterable);
  }
  append(...elements: T[]) {
    elements.forEach((e) => this.push(e));
    return this;
  }
  cdr() {
    const list = this.clone();
    if (list.isEmpty) return list;
    let previousHead = list.head;
    if (list.isUnary) {
      list.head = bnode();
      list.tail = bnode();
    } else {
      list.head = previousHead.right!;
      list.head.left = bnode();
      previousHead.right = bnode();
    }
    list.len--;
    return list;
  }
  car() {
    if (this.isEmpty) return this;
    const head = this.head.data!;
    return new LinkedList<T>().push(head);
  }
  get last() {
    return this.tail.data;
  }
  get first() {
    return this.head.data;
  }

  *[Symbol.iterator](): IterableIterator<T> {
    let node = this.head;
    while (node.isSomething()) {
      yield node.data!;
      node = node.right!;
    }
  }

  clear() {
    this.head = bnode();
  }

  pop() {
    if (this.isEmpty) return null;
    let popped = this.tail;
    if (this.isUnary) {
      this.head = bnode();
      this.tail = bnode();
    } else {
      this.tail = popped.left!;
      this.tail.right = bnode();
      popped.left = bnode();
    }
    this.len--;
    return popped.data;
  }

  toArray(): T[] {
    if (this.len === 0) return [];
    return [...this];
  }

  private tick() {
    this.len++;
  }

  forEach(
    f: (data: T, index: number, list: LinkedList<T>) => void,
  ) {
    if (this.isEmpty) return this;
    let node = this.head;
    let i = 0;
    while (node !== null) {
      node.do((d) => f(d, i, this));
      node = node.right!;
      i++;
    }
  }

  map<K>(f: (data: T, index: number, list: LinkedList<T>) => K) {
    const list = new LinkedList<K>();
    this.forEach((d, i, l) => list.push(f(d, i, l)));
    return list;
  }

  push(element: T) {
    const node = bnode(element);
    if (this.head.isNothing()) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.right = node;
      node.left = this.tail;
      this.tail = node;
    }
    this.tick();
    return this;
  }
  clone() {
    const list = new LinkedList<T>();
    this.forEach((d) => list.push(d));
    return list;
  }
  #reduce<X>(
    from: 0 | 1,
    reducer: (
      accumulator: X,
      currentValue: T,
      index: number,
      list: LinkedList<T>,
    ) => X,
    initialValue: X,
  ) {
    let i = 0;
    const fn = (list: LinkedList<T>, init: X): X => {
      if (list.isEmpty) return init;
      else {
        const popped = list[from === 0 ? "shift" : "pop"]();
        if (popped === null) return init;
        const updatedValue = reducer(init, popped, i++, list);
        return fn(list, updatedValue);
      }
    };
    return fn(this.clone(), initialValue);
  }
  reduceRight<X>(
    reducer: (
      accumulator: X,
      currentValue: T,
      index: number,
      list: LinkedList<T>,
    ) => X,
    initialValue: X,
  ): X {
    return this.#reduce(1, reducer, initialValue);
  }
  reduce<X>(
    reducer: (
      accumulator: X,
      currentValue: T,
      index: number,
      list: LinkedList<T>,
    ) => X,
    initialValue: X,
  ): X {
    return this.#reduce(0, reducer, initialValue);
  }
  join(separator: string = "") {
    return [...this].join(separator);
  }
  toString(f?: (x: T, index: number) => string) {
    const out = this.clone();
    const g = f ? f : (x: T, index: number) => x;
    return out.map((d, i) => g(d, i)).join();
  }
  filter(
    predicate: (value: T, index: number, list: LinkedList<T>) => boolean,
  ) {
    const out = new LinkedList<T>();
    this.forEach((n, i, list) => predicate(n, i, list) && out.push(n));
    return out;
  }
  reverse() {
    let current = this.head;
    while (current.isSomething()) {
      const right = current.right;
      current.right = current.left;
      current.left = right;
      let k = current.left;
      if (k === null) break;
      current = k;
    }
    const tail = this.tail;
    this.tail = this.head;
    this.head = tail;
    return this;
  }

  zip<K>(list: LinkedList<K>) {
    const out = new LinkedList<[T, K]>();
    this.forEach((d, i) => {
      const x = list.item(i);
      if (x !== null) {
        const element: [T, K] = [d, x] as [T, K];
        out.push(element);
      }
    });
    return out;
  }
}

export const linkedList = <T>(...elements: T[]) => {
  return new LinkedList<T>().append(...elements);
};
