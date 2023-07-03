import { BNode, bnode } from "../nodes/bnode.js";
import { linkedList } from "../list.js";
import { leaf, subtree, Tree, TreeChild } from "../treenode.js";
import { tree, TreeSpace } from "../tree.js";

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
  draw() {
    const root = tree(this.getid(this.root.data));
    const nodes: TreeChild[] = [];
    if (this.root.left !== null) {
      const leftsubtree = this.root.left.fignode(this.getid);
      nodes[0] = leftsubtree;
    }
    if (this.root.right !== null) {
      const rightsubtree = this.root.right.fignode(this.getid);
      nodes[1] = rightsubtree;
    }
    root.nodes(nodes);
    return root;
  }
  toArray(order: "preorder" | "inorder" | "postorder" | "bfs") {
    const out: T[] = [];
    this[order]((d) => out.push(d));
    return out;
  }
  map<K>(
    callback: (data: T, node: BNode<T>) => K,
    accessor: (data: K) => string | number,
  ) {
    const out = new BST<K>(accessor as any);
    this.postorder((d, node) => {
      out.push(callback(d, node));
    });
    return out;
  }
  postorder(callback: (data: T, node: BNode<T>) => void) {
    const traverse = (node: BNode<T>) => {
      node.onLeft((n) => traverse(n));
      node.onRight((n) => traverse(n));
      node.map((d) => callback(d, node));
    };
    traverse(this.root);
    return this;
  }
  inorder(callback: (data: T, node: BNode<T>) => void) {
    const traverse = (node: BNode<T>) => {
      node.onLeft((n) => traverse(n));
      node.map((d) => callback(d, node));
      node.onRight((n) => traverse(n));
    };
    traverse(this.root);
    return this;
  }
  preorder(callback: (data: T, node: BNode<T>) => void) {
    const traverse = (node: BNode<T>) => {
      node.map((d) => callback(d, node));
      node.onLeft((n) => traverse(n));
      node.onRight((n) => traverse(n));
    };
    traverse(this.root);
    return this;
  }
  bfs(callback: (data: T, node: BNode<T>, index: number) => void) {
    const queue = linkedList<BNode<T>>(this.root);
    let i = 0;
    while (queue.length !== 0) {
      const node = queue.shift();
      if (node === null) break;
      node.map((d) => callback(d, node, i));
      node.onLeft((n) => queue.push(n));
      node.onRight((n) => queue.push(n));
      i++;
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
    if (this.root === null || this.root.isNothing()) {
      this.root = newnode;
      this.length++;
      return this;
    } else {
      const insert = (node: BNode<T>): boolean => {
        if (this.getid(newnode.data) < this.getid(node.data)) {
          if (node.left === null) {
            node.left = newnode;
            return true;
          } else return insert(node.left);
        } else if (this.getid(newnode.data) > this.getid(node.data)) {
          if (node.right === null) {
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

