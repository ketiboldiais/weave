import { Typed, typed } from "./typed.js";
import { FigNode } from "./node.types.js";
import { Box, box, unsafe } from "./aux.js";
import { colorable } from "./colorable.js";
import { TextNode, label } from "./text.js";

class Subtree {
  children: TreeChild[];
  root: LeafNode;
  constructor(name: string) {
    this.root = leaf(name);
    this.children = [];
  }
  get name() {
    return this.root.name;
  }
  get label() {
    return this.root;
  }
  get index() {
    return this.root.index;
  }
  set index(index: number) {
    this.root.index = index;
  }
  onLastChild(f: (node: LeafNode) => void) {
    if (this.degree) {
      f(this.children[this.degree - 1].root);
    }
  }
  onFirstChild(f: (node: LeafNode) => void) {
    if (this.degree) {
      f(this.children[0].root);
    }
  }
  get parent() {
    return this.root.parent;
  }
  set parent(node: TreeChild | null) {
    this.root.parent = node;
  }
  forEach(f: (node: TreeChild, index: number) => void) {
    this.children.forEach((n, i) => f(n, i));
    return this;
  }

  get degree() {
    return this.children.length;
  }

  childOf(parent: LeafNode) {
    this.parent = parent.root;
    return this;
  }

  nodes(nodes: TreeChild[]) {
    nodes.forEach((node) => {
      const n = node.childOf(this.root);
      n.index = this.degree;
      this.children.push(n);
    });
    return this;
  }

  node(node: TreeChild) {
    this.children.push(node);
    return this;
  }
}

const subtreeNode = typed(colorable(Subtree));

export const subtree = (label: string | number) => {
  return new subtreeNode(`${label}`).typed("subtree");
};

export type SubtreeNode = ReturnType<typeof subtree>;

export const isBranch = (
  node: FigNode
): node is SubtreeNode => {
  return !unsafe(node) && node.isType("subtree");
};

class Leaf {
  name: string;
  x: number = 0;
  y: number = 0;
  dx: number = 0;
  dy: number = 0;
  depth: number = 0;
  height: number = 0;
  parent: TreeChild | null = null;
  children: TreeChild[] = [];
  /**
   * The index of this node among
   * its parent’s children array.
   */
  index: number = 0;
  get root() {
    return this;
  }
  constructor(name: string) {
    this.name = name;
  }
  childOf(parent: LeafNode) {
    this.parent = parent.root;
    return this;
  }
  get degree() {
    return 0;
  }
  forEach(f: (node: TreeChild, index: number) => void) {
    return this;
  }
  onFirstChild(f: (node: LeafNode) => void) {}
  onLastChild(f: (node: LeafNode) => void) {}
}

const leafNode = typed(colorable(Leaf));
export const leaf = (label: string | number) => {
  return new leafNode(`${label}`).typed("leaf");
};

export type LeafNode = ReturnType<typeof leaf>;

export const isLeaf = (node: FigNode): node is LeafNode => {
  return !unsafe(node) && node.isType("leaf");
};

export type TreeChild = LeafNode | SubtreeNode;
