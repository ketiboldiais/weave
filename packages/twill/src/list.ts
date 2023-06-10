class ListItem<T> {
  data: T | null;
  private _next: () => ListItem<T>;
  private _prev: () => ListItem<T>;
  constructor(data: T | null) {
    this.data = data;
    this._next = () => ListItem.none();
    this._prev = () => ListItem.none();
  }
  flatten(): ListItem<T> | T {
    return this.data === null ? ListItem.none<T>() : this.data;
  }
  map<K>(callback: (data: T) => K) {
    if (this.data) {
      return ListItem.some<K>(callback(this.data));
    } else return ListItem.none<K>();
  }
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
  get next() {
    return this._next();
  }
  set next(node: ListItem<T>) {
    this._next = () => node;
  }
  get prev() {
    return this._prev();
  }
  set prev(node: ListItem<T>) {
    this._prev = () => node;
  }
  static none<T>() {
    return new ListItem<T>(null);
  }
  static some<T>(data: T) {
    return new ListItem(data);
  }
}

const item = <T>(data?: T) => {
  return data === undefined ? ListItem.none<T>() : ListItem.some<T>(data);
};

export class LinkedList<T> {
  #head: ListItem<T>;
  #tail: ListItem<T>;
  #length: number;
  constructor() {
    this.#head = item();
    this.#tail = item();
    this.#length = 0;
  }
  get lastIndex() {
    const l = this.#length;
    return l === 0 ? l : l - 1;
  }
  get isUnary() {
    return this.#length === 1;
  }
  get isEmpty() {
    return this.#length === 0 || this.#head.isNothing();
  }
  #validIndex(i: number) {
    return 0 <= i && i < this.length;
  }
  #item(index: number) {
    if (!this.#validIndex(index)) {
      return item<T>();
    } else {
      let count = 0;
      let current = this.#head;
      while (count !== index) {
        current = current.next;
        count++;
      }
      return current;
    }
  }
  ith(index:number, fallback:T): T {
    const out = this.#item(index).data
    return out === null ? fallback : out;
  }
  item<T>(index: number) {
    return this.#item(index).data;
  }
  unshift(element: T) {
    const node = item(element);
    if (this.isEmpty) {
      this.#head = node;
      this.#tail = node;
    } else {
      this.#head.prev = node;
      node.next = this.#head;
      this.#head = node;
    }
    this.#length++;
    return this;
  }
  lop() {
  }
  shift() {
    if (this.isEmpty) return null;
    let previousHead = this.#head;
    if (this.isUnary) {
      this.#head = item();
      this.#tail = item();
    } else {
      this.#head = previousHead.next;
      this.#head.prev = item();
      previousHead.next = item();
    }
    this.#length--;
    return previousHead.data;
  }
  set(element: T, at: number) {
    const node = this.#item(at);
    node.value = element;
    return this;
  }
  insert(element: T, atIndex: number) {
    if (!this.#validIndex(atIndex)) {
      return this;
    }
    if (atIndex === 0) {
      return this.unshift(element);
    }
    if (this.lastIndex === atIndex) {
      return this.push(element);
    }
    const node = item(element);
    const before = this.#item(atIndex - 1);
    const after = before.next;
    before.next = node;
    node.prev = before;
    node.next = after;
    after.prev = node;
    this.#length++;
    return this;
  }
  add(element: T) {
    return ({
      before: (index: number) => this.insert(element, index - 1),
      at: (index: number) => this.insert(element, index),
      after: (index: number) => this.insert(element, index + 1),
    });
  }
  tail(fallback: T) {
    return this.last ? this.last : fallback;
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
    let previousHead = list.#head;
    if (list.isUnary) {
      list.#head = item();
      list.#tail = item();
    } else {
      list.#head = previousHead.next;
      list.#head.prev = item();
      previousHead.next = item();
    }
    list.#length--;
    return list;
  }
  car() {
    if (this.isEmpty) return this;
    const head = this.#head.data!;
    return new LinkedList<T>().push(head);
  }

  get last() {
    return this.#tail.data;
  }
  get first() {
    return this.#head.data;
  }
  get length() {
    return this.#length;
  }

  *[Symbol.iterator](): IterableIterator<T> {
    let node = this.#head;
    while (node.isSomething()) {
      yield node.data!;
      node = node.next;
    }
  }

  clear() {
    this.#head = item();
  }

  pop() {
    if (this.isEmpty) return null;
    let popped = this.#tail;
    if (this.isUnary) {
      this.#head = item();
      this.#tail = item();
    } else {
      this.#tail = popped.prev;
      this.#tail.next = item();
      popped.prev = item();
    }
    this.#length--;
    return popped.data;
  }

  toArray(): T[] {
    if (this.#length === 0) return [];
    return [...this];
  }

  private tick() {
    this.#length++;
  }

  forEach(
    f: (data: T, index: number, list: LinkedList<T>) => void,
  ) {
    if (this.isEmpty) return this;
    let node = this.#head;
    let i = 0;
    while (!node.isNothing()) {
      node.do((d) => f(d, i, this));
      node = node.next;
      i++;
    }
  }

  map<K>(f: (data: T, index: number, list: LinkedList<T>) => K) {
    const list = new LinkedList<K>();
    this.forEach((d, i, l) => list.push(f(d, i, l)));
    return list;
  }

  push(element: T) {
    const node = item(element);
    if (this.#head.isNothing()) {
      this.#head = node;
      this.#tail = node;
    } else {
      this.#tail.next = node;
      node.prev = this.#tail;
      this.#tail = node;
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
  foldr<X>(
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
  fold<X>(
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
    let current = this.#head;
    while (current.isSomething()) {
      const next = current.next;
      current.next = current.prev;
      current.prev = next;
      current = current.prev;
    }
    const tail = this.#tail;
    this.#tail = this.#head;
    this.#head = tail;
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

export const linkedList = <T>(...elements:T[]) => {
  return new LinkedList<T>().append(...elements);
};
