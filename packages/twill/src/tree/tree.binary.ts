import { BNode, bnode } from "../nodes/bnode.js";
import { linkedList } from "../list.js";
import { leaf, subtree } from "../treenode.js";
import { tree } from "../tree.js";

class BST<T> {
  root: BNode<T>;
  getid: (data: T | null) => string | number;
  /** The number of nodes in this tree. */
  length: number;
  constructor(getid: (data: T) => string | number) {
    this.root = bnode();
    this.getid = (data: T | null) => (data === null) ? "" : getid(data);
    this.length = 0;
  }
  toArray(order: "preorder" | "inorder" | "postorder" | "bfs") {
    const out: T[] = [];
    this[order]((d) => out.push(d));
    return out;
  }
  postorder(callback: (data: T) => void) {
    const traverse = (node: BNode<T>) => {
      node.onLeft((n) => traverse(n));
      node.onRight((n) => traverse(n));
      node.map((d) => callback(d));
    };
    traverse(this.root);
    return this;
  }
  inorder(callback: (data: T) => void) {
    const traverse = (node: BNode<T>) => {
      node.onLeft((n) => traverse(n));
      node.map((d) => callback(d));
      node.onRight((n) => traverse(n));
    };
    traverse(this.root);
    return this;
  }
  preorder(callback: (data: T) => void) {
    const traverse = (node: BNode<T>) => {
      node.map((d) => callback(d));
      node.onLeft((n) => traverse(n));
      node.onRight((n) => traverse(n));
    };
    traverse(this.root);
    return this;
  }
  bfs(callback: (data: T) => void) {
    const queue = linkedList<BNode<T>>(this.root);
    while (queue.length !== 0) {
      const node = queue.shift();
      if (node === null) break;
      node.map((d) => callback(d));
      node.onLeft((n) => queue.push(n));
      node.onRight((n) => queue.push(n));
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
    const newnode = bnode(data);
    if (this.root.isNothing()) {
      this.root = newnode;
      this.length++;
      return this;
    } else {
      const insert = (node: BNode<T>): boolean => {
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
export const bst = <T>(data: T[]) => ({
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

