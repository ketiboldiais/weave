import { Binode, binode } from "./nodes/binode.js";
import { linkedList } from "./list.js";

class BST<T> {
  root: Binode<T>;
  getid: (data: T | null) => string | number;
  /** The number of nodes in this tree. */
  length: number;
  constructor(getid: (data: T) => string | number) {
    this.root = binode();
    this.getid = (data: T | null) => (data === null) ? "" : getid(data);
    this.length = 0;
  }
  get isEmpty() {
    return this.root.isNothing();
  }
  toArray(order: "preorder" | "inorder" | "postorder" | "bfs") {
    const out: T[] = [];
    switch (order) {
      case "bfs": {
        this.bfs((d) => out.push(d));
        break;
      }
      case "preorder": {
        this.preorder((d) => out.push(d));
        break;
      }
      case "inorder": {
        this.inorder((d) => out.push(d));
        break;
      }
      case "postorder": {
        this.postorder((d) => out.push(d));
        break;
      }
    }
    return out;
  }
  postorder(callback: (data: T) => void) {
    const traverse = (node: Binode<T>) => {
      if (node.left.isSomething()) traverse(node.left);
      if (node.right.isSomething()) traverse(node.right);
      node.map((d) => callback(d));
    };
    traverse(this.root);
    return this;
  }
  inorder(callback: (data: T) => void) {
    const traverse = (node: Binode<T>) => {
      if (node.left.isSomething()) traverse(node.left);
      node.map((d) => callback(d));
      if (node.right.isSomething()) traverse(node.right);
    };
    traverse(this.root);
    return this;
  }
  preorder(callback: (data: T) => void) {
    const traverse = (node: Binode<T>) => {
      node.map((d) => callback(d));
      if (node.left.isSomething()) traverse(node.left);
      if (node.right.isSomething()) traverse(node.right);
    };
    traverse(this.root);
    return this;
  }
  bfs(callback: (data: T) => void) {
    const queue = linkedList<Binode<T>>(this.root);
    while (queue.length !== 0) {
      const node = queue.shift();
      if (node === null) break;
      node.map((d) => callback(d));
      if (node.left.isSomething()) queue.push(node.left);
      if (node.right.isSomething()) queue.push(node.right);
    }
    return this;
  }
  nodes(data: T[]) {
    data.forEach((d) => {
      this.push(d);
    });
    return this;
  }
  push(data: T): this {
    const newnode = binode(data);
    if (this.root.isNothing()) {
      this.root = newnode;
      this.length++;
      return this;
    } else {
      const insert = (node: Binode<T>): boolean => {
        if (this.getid(newnode.data) < this.getid(node.data)) {
          if (node.left.isNothing()) {
            node.left = newnode;
            return true;
          } else return insert(node.left);
        } else if (this.getid(newnode.data) > this.getid(node.data)) {
          if (node.right.isNothing()) {
            node.right = newnode;
            return true;
          } else return insert(node.right);
        } else {
          return false;
        }
      };
      const out = insert(this.root);
      if (out) this.length++;
    }
    return this;
  }
}

/**
 * Creates a new binary search tree
 * from the given array of data.
 */
const bst = <T>(data: T[]) => ({
	/** 
	 * The id accessor function for the data. To ensure
	 * comparison operations are performed meaningfully,
	 * all tree data structures require an accessor
	 * function that takes data provided and returns
	 * either a string or a number.
	 */
  id: (getid: (data: T) => string | number) => (
    new BST<T>(getid).nodes(data)
  ),
});

const b = bst([10, 6, 3, 15, 3, 8, 20]).id((d) => d);
