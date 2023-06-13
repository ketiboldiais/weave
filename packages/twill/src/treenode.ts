import { FigNode } from ".";
import { arraySplit, unsafe } from "./aux.js";
import { colorable } from "./colorable.js";
import { linkedList } from "./list.js";
import { Text } from "./text.js";
import { typed } from "./typed";

const TREENODE = typed(colorable(Text));

abstract class TreeNode extends TREENODE {
  thread: TreeChild | null = null;
  parent: Tree | null;
  children: TreeChild[] = [];
  index: number = 0;
  constructor(name: string, parent: Tree | null) {
    super(name);
    this.parent = parent;
  }
  rightMostSibling(): TreeChild | null {
    let sib = null;
    if (this.parent && this.parent.degree > 1) {
      const d = this.parent.children.length;
      sib = this.parent.children[d - 1];
      sib = sib ? sib : null;
    }
    return sib;
  }
  leftmostSibling(): TreeChild | null {
    let sib = null;
    if (this.parent && this.parent.degree > 1) {
      sib = this.parent.children[0];
      sib = sib ? sib : null;
    }
    return sib;
  }
  lsib() {
    let sib = null;
    if (this.parent && this.parent.degree > 1) {
      sib = this.parent.children[this.index - 1];
      sib = sib ? sib : null;
    }
    return sib;
  }
  rsib() {
    let sib = null;
    if (this.parent && this.parent.degree > 1) {
      sib = this.parent.children[this.index + 1];
      sib = sib ? sib : null;
    }
    return sib;
  }
  abstract onLastChild(
    callback: (node: TreeChild) => void
  ): void;
  abstract onFirstChild(
    callback: (node: TreeChild) => void
  ): void;
}

export class LeafNode extends TreeNode {
  ancestor: TreeChild;
  constructor(name: string, parent: Tree | null = null) {
    super(name, parent);
    this.ancestor = this;
    this.type = "leaf";
    this.cx = -1;
  }
  onLastChild(callback: (node: TreeChild) => void) {
    return;
  }
  onFirstChild(callback: (node: TreeChild) => void) {
    return;
  }
  get degree() {
    return 0;
  }
  childOf(parent: Tree) {
    this.parent = parent;
    this.ancestor = parent.ancestor;
    return this;
  }
}

export const leaf = (name: string) => {
  return new LeafNode(name);
};

export const isLeaf = (
  node: FigNode
): node is LeafNode => !unsafe(node) && node.isType("leaf");

export class Tree extends TreeNode {
  ancestor: TreeChild;
  get degree() {
    return this.children.length;
  }
  onLastChild(callback: (node: TreeChild) => void) {
    const c = this.children[this.children.length - 1];
    if (c) callback(c);
    return this;
  }
  onFirstChild(callback: (node: TreeChild) => void) {
    const c = this.children[0];
    if (c) callback(c);
    return this;
  }
  constructor(name: string, parent: Tree | null = null) {
    super(name, parent);
    this.type = "subtree";
    this.ancestor = this;
    this.cx = -1;
  }
  childOf(parent: Tree) {
    this.index = parent.degree;
    this.parent = parent;
    this.ancestor = parent.ancestor;
    return this;
  }
  nodes(nodes: TreeChild[]) {
    nodes.forEach((node) => {
      node.index = this.degree;
      this.children.push(node.childOf(this));
    });
    return this;
  }
  child(child: TreeChild) {
    child.childOf(this);
    this.children.push(child);
    return this;
  }
  inorder(f: (node: TreeChild, index: number) => void) {
    let i = 0;
    const t = (tree: TreeChild) => {
      const [left, right] = arraySplit(tree.children);
      left.length && left.forEach((c) => t(c));
      f(tree, i++);
      right.length && right.forEach((c) => t(c));
    };
    t(this);
    return this;
  }
  preorder(f: (node: TreeChild, index: number) => void) {
    let i = 0;
    const t = (tree: TreeChild) => {
      const [left, right] = arraySplit(tree.children);
      f(tree, i++);
      left.length && left.forEach((c) => t(c));
      right.length && right.forEach((c) => t(c));
    };
    t(this);
    return this;
  }
  postorder(f: (node: TreeChild, index: number) => void) {
    let i = 0;
    const t = (tree: TreeChild) => {
      const [left, right] = arraySplit(tree.children);
      left.length && left.forEach((c) => t(c));
      right.length && right.forEach((c) => t(c));
      f(tree, i++);
    };
    t(this);
    return this;
  }
  bfs(f: (node: TreeChild, level: number) => void) {
    const queue = linkedList<TreeChild>(this);
    let count = queue.length;
    let level = 0;
    while (queue.length > 0) {
      const tree = queue.shift();
      count--;
      if (!tree) continue;
      f(tree, level);
      tree.children.forEach((c) => queue.push(c));
      if (count === 0) {
        level++;
        count = queue.length;
      }
    }
    queue.clear();
    return this;
  }
}
export const subtree = (name: string) => {
  return new Tree(name);
};
export const isTree = (node: FigNode): node is Tree =>
  !unsafe(node) && node.isType("subtree");

export type TreeChild = Tree | LeafNode;
