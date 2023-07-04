import { BNode, bnode, none, Option, some } from "./index.js";

export class LinkedList<T> {
  private head: BNode<T>;
  private tail: BNode<T>;
  private count: number;
  cdr() {
    const list = this.clone();
    if (list.isEmpty) return list;
    let previousHead = list.head;
    if (list.count === 1) {
      list.head = bnode();
      list.tail = bnode();
    } else {
      list.head = previousHead.right!;
      list.head.left = bnode();
      previousHead.right = bnode();
    }
    list.count--;
    return list;
  }
  car() {
    if (this.isEmpty) return this;
    const head = this.head.data!;
    return new LinkedList<T>().push(head);
  }
  clear() {
    this.head = bnode();
  }
  get length() {
    return this.count;
  }
  get isEmpty() {
    return this.count === 0 || this.head.isNothing();
  }
  constructor() {
    this.count = 0;
    this.head = bnode();
    this.tail = bnode();
  }
  *[Symbol.iterator](): IterableIterator<T> {
    let node = this.head;
    while (node.data !== null) {
      yield node.data;
      node = node.right;
    }
  }
  toArray(): T[] {
    return [...this];
  }
  safeIdx(i: number) {
    return 0 <= i && i < this.count;
  }
  set(element: T, at: number) {
    const node = this.at(at);
    node.data = element;
    return this;
  }
  private at(index: number) {
    if (!this.safeIdx(index)) {
      return bnode<T>();
    } else {
      let count = 0;
      let current = this.head;
      while (count !== index) {
        let k = current.right;
        if (k.isNothing()) break;
        current = k;
        count++;
      }
      return current;
    }
  }

  map<K>(f: (data: T, index: number, list: LinkedList<T>) => K) {
    const list = new LinkedList<K>();
    this.forEach((d, i, l) => list.push(f(d, i, l)));
    return list;
  }

  forEach(
    f: (data: T, index: number, list: LinkedList<T>) => void,
  ) {
    if (this.isEmpty) return this;
    let node = this.head;
    let i = 0;
    while (i < this.count) {
      node.do((d) => f(d, i, this));
      node = node.right;
      i++;
    }
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
        if (popped._tag === "None") return init;
        const updatedValue = reducer(init, popped.value, i++, list);
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
    let i = 0;
    while (current.isSomething() && i < this.count) {
      const right = current.right;
      current.right = current.left;
      current.left = right;
      let k = current.left;
      if (k.isNothing() || i > this.count) break;
      current = k;
      i++;
    }
    const tail = this.tail;
    this.tail = this.head;
    this.head = tail;
    return this;
  }

  item(index: number) {
    return this.at(index).data;
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

  pop(): Option<T> {
    if (this.isEmpty) return none();
    let popped = this.tail;
    if (this.length === 1) {
      this.head = bnode();
      this.tail = bnode();
    } else {
      this.tail = popped.left;
      this.tail.right = bnode();
      popped.left = bnode();
    }
    this.count--;
    return popped.data === null ? none() : some(popped.data);
  }
  unshift(element: T) {
    const node = bnode(element);
    if (this.isEmpty) {
      this.head = node;
      this.tail = node;
    } else {
      this.head.prev = node;
      node.next = this.head;
      this.head = node;
    }
    this.count++;
    return this;
  }
  shift() {
    if (this.isEmpty) return none();
    const previousHead = this.head;
    if (this.length === 1) {
      this.head = bnode();
      this.tail = bnode();
    } else {
      this.head = previousHead.next;
      this.head.prev = bnode();
      previousHead.prev = bnode();
    }
    this.count--;
    return previousHead.data === null ? none() : some(previousHead.data);
  }
  push(element: T) {
    const node = bnode(element);
    if (this.head.isNothing()) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    this.count++;
    return this;
  }
  append(...elements: T[]) {
    elements.forEach((e) => this.push(e));
    return this;
  }
}

export const linkedList = <T>(...elements: T[]) => {
  return new LinkedList<T>().append(...elements);
};

// const l = linkedList(1, 2, 3, 4);
// const x = linkedList(3, 5, 2, 1);
// console.log(l.zip(x));
