import {
  ArrowDefNode,
  FigNode,
  line,
  LineNode,
  Space,
  spatial2D,
} from "./index.js";
import { colorable } from "./colorable.js";
import { typed } from "./typed.js";
import { arraySplit, unsafe } from "./aux.js";
import { linkedList } from "./list.js";

export type Linkable = LeafNode;

export type TreeRenderData = {
  nodes: LeafNode[];
  edges: LinkNode[];
  annotations: TreeAnnotation[];
};

class Link {
  source: Linkable;
  target: Linkable;
  constructor(source: Linkable, target: Linkable) {
    this.source = source;
    this.target = target;
  }
}
export const link = (source: Linkable, target: Linkable) => {
  const fig = typed(colorable(Link));
  return new fig(source, target).typed("link");
};
export type LinkNode = ReturnType<typeof link>;
export const isLink = (node: FigNode): node is LinkNode => {
  if (unsafe(node)) return false;
  return node.type === "link";
};

type TNode = SubtreeNode | LeafNode;

type TreeAnnotationOption =
  | "preorder-traversal"
  | "inorder-traversal"
  | "postorder-traversal"
  | "bfs-traversal";

type TreeAnnotation = LineNode;

class Tree extends Space {
  name: string;
  data: SubtreeNode;
  constructor(name: string) {
    super();
    this.name = name;
    this.data = subtree(name);
  }
  private nodemapFn?: (n: LeafNode) => LeafNode;
  private edgemapFn?: (n: LinkNode) => LinkNode;

  private annotations: Set<TreeAnnotationOption> = new Set();

  /**
   * @method
   * Includes the supplied {@link TreeAnnotation}
   * during processing. Valid options include:
   *
   * 1. `preorder-traversal`. Includes an array
   *    of {@link ArrowDefNode|arrowed} {@link LineNode|line data}
   *    in the output of {@link Tree.elements}. The lines’
   *    coordinates correspond to an inorder traversal
   *    of the tree.
   */
  annotate(...options: TreeAnnotationOption[]) {
    options.forEach((option) => this.annotations.add(option));
    return this;
  }

  /**
   * @method
   * Provides access to the resulting
   * edgelist of {@link Tree.treeData}.
   * Note that because the tree’s process data are
   * prepared lazily, this method will
   * only take effect if called
   * _before_ {@link Tree.treeData}.
   */
  edgemap(callback: (n: LinkNode) => LinkNode) {
    this.edgemapFn = callback;
    return this;
  }

  /**
   * @method
   * Provides access to the resulting
   * edgelist of {@link Tree.datum}. Note that
   * because the tree’s properties are prepared
   * lazily, this method will only take
   * effect if called _before_ {@link Tree.datum}.
   */
  nodemap(callback: (n: LeafNode) => LeafNode) {
    this.nodemapFn = callback;
    return this;
  }

  datum(): TreeRenderData {
    const output: TreeRenderData = {
      nodes: [],
      edges: [],
      annotations: [],
    };
    const root = this.data;
    const treeNodes: Record<string, LeafNode> = {};

    treeNodes[root.name()] = root.root;

    this.postorder((node, i) => {
      const name = node.name();
      node.offsetX(i % 2 === 0 ? -1 : 1);
      treeNodes[name] = node;
    });

    this.bfs((node, level) => {
      const name = node.name();
      if (treeNodes[name]) {
        const y = 0 - level;
        treeNodes[name].position("y", y);
        treeNodes[name].depth = Math.abs(y);
      }
      return node;
    });

    this.inorder((node, index) => {
      const name = node.name();
      if (treeNodes[name]) {
        treeNodes[name].position("x", index);
      }
      return node;
    });

    const nodes = Object.values(treeNodes);
    const nodemap = this.nodemapFn;
    if (nodemap !== undefined) {
      nodes.forEach((n) => output.nodes.push(nodemap(n)));
    } else {
      nodes.forEach((n) => output.nodes.push(n));
    }
    const edgemap = this.edgemapFn;
    const parent = root.root;
    nodes.forEach((node) => {
      let L = link(parent, node);
      if (treeNodes[node.parent]) {
        const parent = treeNodes[node.parent];
        L = link(parent, node);
      }
      (parent.name() !== node.name()) &&
        output.edges.push(edgemap ? edgemap(L) : L);
    });

    if (this.annotations.size) {
      const f = (name: string) => treeNodes[name] ? treeNodes[name] : null;
      const addLine = (l: LineNode) => output.annotations.push(l);
      this.annotations.has("preorder-traversal") &&
        this.annotateTree("preorder", f).forEach(addLine);

      this.annotations.has("postorder-traversal") &&
        this.annotateTree("postorder", f).forEach(addLine);

      (this.annotations.has("inorder-traversal")) &&
        this.annotateTree("inorder", f).forEach(addLine);

      (this.annotations.has("bfs-traversal")) &&
        this.annotateTree("bfs", f).forEach(addLine);
    }

    return output;
  }

  private annotateTree(
    option: "preorder" | "postorder" | "inorder" | "bfs",
    target: (name: string) => null | LeafNode,
  ) {
    const list = linkedList<LeafNode>();
    this[option]((node) => {
      const name = node.name();
      const point = target(name);
      if (point) {
        list.push(point);
      }
    });
    const rest = list.cdr();
    const lines = list.zip(rest).map(([a, b]) => line(a.x, a.y, b.x, b.y));
    list.clear();
    return lines;
    // lines.forEach((line) => elements.push(line));
  }

  private nodify(tree: TNode) {
    const node = isLeafNode(tree) ? tree : tree.root;
    const [left, right] = arraySplit(tree.children);
    return { node, left, right };
  }

  nodes(treenodes: (SubtreeNode | LeafNode)[]) {
    treenodes.forEach((node) => this.data.children.push(node));
    return this;
  }
  /**
   * Performs a preorder traveral of this tree.
   * That is, the traversal sequence:
   * ~~~
   * (node, left-subtree, right-subtree)
   * ~~~
   */
  preorder(
    f?: (
      node: LeafNode,
      index: number,
      tree: SubtreeNode | LeafNode,
    ) => void,
  ) {
    let i = 0;
    const t = (tree: TNode) => {
      const { node, left, right } = this.nodify(tree);
      f && f(node, i++, tree);
      left.map((n) => t(n));
      right.map((n) => t(n));
    };
    t(this.data);
    return this;
  }
  /**
   * Performs an postorder traveral of this tree.
   * That is, the traversal sequence:
   * ~~~
   * (node, left-subtree, right-subtree)
   * ~~~
   */
  postorder(
    f?: (
      node: LeafNode,
      index: number,
      tree: SubtreeNode | LeafNode,
    ) => void,
  ) {
    let i = 0;
    const t = (tree: SubtreeNode | LeafNode) => {
      const { node, left, right } = this.nodify(tree);
      left.map((n) => t(n));
      right.map((n) => t(n));
      f && f(node, i++, tree);
    };
    t(this.data);
    return this;
  }
  /**
   * Performs an inorder traveral of this tree.
   * That is, the traversal sequence:
   * ~~~
   * (node, left-subtree, right-subtree)
   * ~~~
   */
  inorder(
    f?: (
      node: LeafNode,
      index: number,
      tree: SubtreeNode | LeafNode,
    ) => void,
  ) {
    let i = 0;
    const t = (tree: TNode) => {
      const { node, left, right } = this.nodify(tree);
      left.map((n) => t(n));
      f && f(node, i++, tree);
      right.map((n) => t(n));
    };
    t(this.data);
    return this;
  }
  /**
   * Performs a level order traveral of this tree.
   * That is, a traversal sequence where each
   * generation is visited before considering
   * the next.
   */
  bfs(
    f?: (node: LeafNode, level: number, tree: SubtreeNode | LeafNode) => void,
  ) {
    let h: Record<number, LeafNode[]> = {};
    const bfs = (tree: SubtreeNode | LeafNode, level: number) => {
      const [left, right] = arraySplit(tree.children);
      let node = isLeafNode(tree) ? tree : tree.root;
      f && f(node, level, tree);
      if (!h[level]) {
        h[level] = [node];
      } else {
        h[level].push(node);
      }
      if (left.length) left.map((n) => bfs(n, level + 1));
      if (right.length) right.map((n) => bfs(n, level + 1));
    };
    bfs(this.data, 0);
    const nodes = Object.values(h);
    return nodes;
  }
}

class SubTree {
  children: (SubtreeNode | LeafNode)[] = [];
  degree() {
    return this.children.length;
  }
  root: LeafNode;
  parent: string = "";
  constructor(name: string) {
    this.root = leaf(name);
  }
  name() {
    return this.root.name();
  }
  branch(node: SubtreeNode) {
    node.root.index = this.degree();
    this.children.push(node);
    return this;
  }
  leaf(name: string | number) {
    const child = leaf(name);
    child.parent = this.name();
    child.index = this.degree();
    this.children.push(child);
    return this;
  }
  node(treeNode: string | number | LeafNode | SubtreeNode): this {
    if (typeof treeNode === "string" || typeof treeNode === "number") {
      return this.leaf(treeNode);
    } else if (isLeafNode(treeNode)) {
      treeNode.parent = this.name();
      treeNode.index = this.degree();
      this.children.push(treeNode);
    } else {
      treeNode.parent = this.name();
      treeNode.root.index = this.degree();
      this.children.push(treeNode);
    }
    return this;
  }
}

const SUBTREE_NODE = typed(colorable(spatial2D(SubTree)));
export const subtree = (name: string) => {
  return new SUBTREE_NODE(name).typed("subtree");
};
export type SubtreeNode = ReturnType<typeof subtree>;
export const isSubtreeNode = (node: FigNode): node is SubtreeNode => {
  if (unsafe(node)) return false;
  return node.type === "subtree";
};

const TREE_NODE = typed(Tree);
/**
 * Creates a new renderable tree.
 * @param name - A unique string value.
 * This must be provided to ensure the
 * tree is non-cylical and rooted.
 */
export const tree = (name: string) => {
  return new TREE_NODE(name).typed("tree");
};
export type TreeNode = ReturnType<typeof tree>;
export const isTreeNode = (node: FigNode): node is TreeNode => {
  if (unsafe(node)) return false;
  return node.type === "tree";
};

class Leaf {
  value: string;
  children: (SubtreeNode | LeafNode)[] = [];
  parent: string = "";
  r: number = 5;
  hx: number = 0;
  index: number = 0;
  depth: number = 0;
  offsetX(value: number) {
    this.hx = value;
    return this;
  }
  constructor(value: string) {
    this.value = value;
  }
  radius(value: number) {
    this.r = value;
    return this;
  }
  name() {
    return this.value;
  }
}

const LEAF_NODE = typed(colorable(spatial2D(Leaf)));
/**
 * Creates a new renderable leaft.
 * @param name - A unique string value.
 * This must be provided to ensure the
 * leaf is unique (thereby ensuring
 * the parent tree is non-cyclical).
 */
export const leaf = (name: string | number) => {
  return new LEAF_NODE(`${name}`).typed("leaf");
};
export type LeafNode = ReturnType<typeof leaf>;
export const isLeafNode = (node: FigNode): node is LeafNode => {
  if (unsafe(node)) return false;
  return node.type === "leaf";
};
/*
const fig = tree("a")
  .nodes([
    subtree("n")
      .leaf("j")
      .leaf("q"),
    subtree("p")
      .leaf("x")
      .branch(
        subtree("w")
          .leaf("r")
          .leaf("e"),
      ),
  ]).annotate("preorder-traversal");

const out = fig.datum();
console.log(out);
*/
