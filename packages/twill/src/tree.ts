import {
  ArrowDefNode,
  FigNode,
  line,
  LineNode,
  Space,
  spatial2D,
  TextNode,
} from "./index.js";
import { colorable } from "./colorable.js";
import { typed } from "./typed.js";
import { arraySplit, unsafe } from "./aux.js";
import { linkedList, LinkedList } from "./list.js";

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
export const link = (
  source: Linkable,
  target: Linkable
) => {
  const fig = typed(colorable(Link));
  return new fig(source, target).typed("link");
};
export type LinkNode = ReturnType<typeof link>;
export const isLink = (node: FigNode): node is LinkNode => {
  if (unsafe(node)) return false;
  return node.type === "link";
};

type TNode = SubtreeNode | LeafNode;
type QueuedNode = {
  node: LeafNode;
  level: number;
  tree: SubtreeNode | LeafNode;
};

type TreeAnnotation = LineNode;

type LineAnnotationRecord = {
  ["preorder-traversal"]?: (line: LineNode) => LineNode;
  ["inorder-traversal"]?: (line: LineNode) => LineNode;
  ["postorder-traversal"]?: (line: LineNode) => LineNode;
  ["bfs-traversal"]?: (line: LineNode) => LineNode;
  ["contour-left"]?: (line: LineNode) => LineNode;
  ["contour-right"]?: (line: LineNode) => LineNode;
  ["contour"]?: (line: LineNode) => LineNode;
  ["threads"]?: (line: LineNode) => LineNode;
};

type TreeAnnotationOption = keyof LineAnnotationRecord;

type TreeLayoutOption =
  | "knuth"
  | "wetherell-shannon"
  | "reingold-tilford";

class Tree extends Space {
  LayoutType: TreeLayoutOption = "wetherell-shannon";
  #has_annotations: boolean = false;

  /**
   * Sets the layout algorithm for the tree.
   *
   * 1. `Knuth` - This is the simplest and the
   *    the fastest of the layouts. The tree
   *    is drawn as a simple inorder traversal,
   *    with each node’s depth serving as the
   *    y-coordinate, and a global incrementer
   *    providing the x-coordinate. This layout
   *    suffices for complete binary trees, but
   *    ill-suited for anything else.
   */
  ala(option: TreeLayoutOption) {
    this.LayoutType = option;
    return this;
  }

  name: string;
  data: SubtreeNode;
  constructor(name: string) {
    super();
    this.name = name;
    this.data = subtree(name);
  }
  private nodemapFn?: (n: LeafNode) => LeafNode;
  private edgemapFn?: (n: LinkNode) => LinkNode;
  private annotations: LineAnnotationRecord =
    {} as LineAnnotationRecord;

  annotate<K extends TreeAnnotationOption>(
    option: K,
    callback?: LineAnnotationRecord[K]
  ) {
    const t = callback ? callback : (l: LineNode) => l;
    this.annotations[option] = t;
    this.#has_annotations = true;
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
    const nodelist: Record<string, LeafNode> = {};
    const edgelist: Record<string, LeafNode[]> = {};
    nodelist[root.name()] = root.root;
    edgelist[root.name()] = [];

    this.bfs((node, level, tree) => {
      const name = node.name();
      nodelist[name] = node.root;
      tree.onParent((parent) => {
        const pname = parent.name();
        node.depth = level;
        if (edgelist[pname]) {
          edgelist[pname].push(node);
        } else {
          edgelist[pname] = [];
        }
      });
    });

    const knuth = () => {
      this.bfs((node, level) => {
        const name = node.name();
        const y = 0 - level;
        nodelist[name].position("y", y);
        nodelist[name].depth = Math.abs(y);
        return node;
      });
      this.inorder((node, index) => {
        const name = node.name();
        nodelist[name].position("x", index);
        return node;
      });
    };

    const wetherellShannon = () => {
      const lay = (
        tree: TNode,
        nexts: number[] = [0],
        offsets: number[] = [0]
      ) => {
        const depth = tree.depth;
        tree.children.forEach((c) => {
          lay(c, nexts, offsets);
        });
        tree.root.position("y", -depth);
        if (nexts[depth] === undefined) {
          nexts[depth] = -1;
        }
        if (offsets[depth] === undefined) {
          offsets[depth] = -1;
        }
        let x = nexts[depth];
        if (tree.degree === 0) {
          x = nexts[depth];
        }
        if (tree.degree === 1) {
          x = tree.children[0].root.x + 1;
        }
        if (tree.degree === 2) {
          const Lx = tree.children[0].root.x;
          const Rx = tree.children[1].root.x;
          const xDistance = Lx + Rx;
          x = xDistance / 2;
        }
        offsets[depth] = Math.max(
          offsets[depth],
          nexts[depth] - x
        );
        if (tree.degree !== 0) {
          const d = x + offsets[depth];
          tree.root.position("x", d);
        } else tree.root.position("x", x);
        nexts[depth] += 2;
        tree.root.hx = offsets[depth];
        nodelist[tree.name()] = tree.root;
      };

      const addHxs = (tree: TNode, sum: number = 0) => {
        tree.root.position("x", tree.root.x + sum);
        sum += tree.root.hx;
        tree.children.forEach((c) => addHxs(c, sum));
      };
      lay(this.data);
      addHxs(this.data);
    };

    const lt = (a: TNode, b: TNode) => a.x < b.x;
    const gt = (a: TNode, b: TNode) => a.x > b.x;

    const contour = (
      tree: TNode,
      compare: (x: TNode, y: TNode) => boolean,
      level: number = 0,
      cont: LinkedList<TNode> | null = null
    ) => {
      if (cont === null) {
        cont = linkedList(tree.root);
      } else if (cont.length < level + 1) {
        cont.push(tree.root);
      } else {
        const l = cont.item(level);
        if (l !== null && compare(l, tree.root)) {
          cont.set(tree.root, level);
        }
      }
      tree.children.forEach((c) =>
        contour(c, compare, level + 1, cont)
      );
      return cont;
    };

    const nextRight = (tree: TNode) => {
      if (tree.thread !== null) return tree.thread;
      if (tree.degree)
        return tree.children[tree.children.length - 1];
      return null;
    };

    const nextLeft = (tree: TNode) => {
      if (tree.thread !== null) return tree.thread;
      if (tree.degree) return tree.children[0];
      return null;
    };

    const out: LineNode[] = [];
    const thread = (
      left: TNode,
      right: TNode,
      leftouter: TNode | null = null,
      rightouter: TNode | null = null
    ): [TNode | null, TNode | null, TNode, TNode] => {
      if (leftouter === null) {
        leftouter = left;
      }
      if (rightouter === null) {
        rightouter = right;
      }
      const lo = nextRight(left);
      const li = nextRight(right);
      const ri = nextLeft(right);
      const ro = nextRight(right);
      if (li && ri) {
        return thread(li, ri, lo, ro);
      }
      return [li, ri, leftouter, rightouter];
    };

    const threadlist = (left: TNode, right: TNode) => {
      const [li, ri, lo, ro] = thread(left, right);
      if (ri && !li) {
        lo.thread = ri;
      } else if (li && !ri) {
        ro.thread = li;
      }
      return line(left.x, right.x, lo.x, ro.y);
    };
    
    const makeThreads = () => {
    }
    
    const tilord = () => {};

    // layout handling
    if (this.LayoutType === "knuth") {
      knuth();
    } else if (this.LayoutType === "wetherell-shannon") {
      wetherellShannon();
    } else if (this.LayoutType === "reingold-tilford") {
      wetherellShannon();
    }

    const nodes = Object.values(nodelist);
    nodes.forEach((node) =>
      output.nodes.push(
        this.nodemapFn ? this.nodemapFn(node) : node
      )
    );

    nodes.forEach((node) => {
      const parent = node.parent ? node.parent : root.root;
      if (parent.name() !== node.name()) {
        const L = link(parent, node);
        output.edges.push(
          this.edgemapFn ? this.edgemapFn(L) : L
        );
      }
    });

    if (this.#has_annotations) {
      const f = (name: string) => nodelist[name];
      const addLine =
        (name: TreeAnnotationOption) => (l: LineNode) => {
          const callback = this.annotations[name];
          output.annotations.push(
            callback ? callback(l) : l
          );
        };
      this.annotations["preorder-traversal"] &&
        this.annotateTree("preorder", f).forEach(
          addLine("preorder-traversal")
        );
      this.annotations["postorder-traversal"] &&
        this.annotateTree("postorder", f).forEach(
          addLine("postorder-traversal")
        );
      this.annotations["inorder-traversal"] &&
        this.annotateTree("inorder", f).forEach(
          addLine("inorder-traversal")
        );
      this.annotations["bfs-traversal"] &&
        this.annotateTree("bfs", f).forEach(
          addLine("bfs-traversal")
        );
      if (
        this.annotations["contour-left"] ||
        this.annotations["contour"] ||
        this.annotations["contour-right"]
      ) {
        if (
          this.annotations["contour-left"] ||
          this.annotations["contour"]
        ) {
          const left = contour(this.data, lt);
          const lines = left
            .zip(left.cdr())
            .map(([a, b]) => line(a.x, a.y, b.x, b.y));
          lines.forEach((l) => output.annotations.push(l));
        }
        if (
          this.annotations["contour-right"] ||
          this.annotations["contour"]
        ) {
          const right = contour(this.data, gt);
          const lines = right
            .zip(right.cdr())
            .map(([a, b]) => line(a.x, a.y, b.x, b.y));
          lines.forEach((l) => output.annotations.push(l));
        }
      }
      if (this.annotations['threads']) {
      }
    }
    return output;
  }

  private annotateTree(
    option: "preorder" | "postorder" | "inorder" | "bfs",
    target: (name: string) => null | LeafNode
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
    const lines = list
      .zip(rest)
      .map(([a, b]) => line(a.x, a.y, b.x, b.y));
    list.clear();
    return lines;
  }

  private nodify(tree: TNode) {
    const [left, right] = arraySplit(tree.children);
    return { left, right };
  }

  nodes(treenodes: (SubtreeNode | LeafNode)[]) {
    let max = 0;
    treenodes.forEach((node) => {
      if (isLeafNode(node)) {
        node.index = this.data.degree;
        node.childOf(this.data.root);
      } else {
        node.root.index = this.data.degree;
        node.root.childOf(this.data.root);
        const h = node.root.height;
        max = h > max ? h : max;
      }
      this.data.children.push(node);
    });
    this.data.root.height = max + 1;
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
      tree: SubtreeNode | LeafNode
    ) => void
  ) {
    let i = 0;
    const t = (tree: TNode) => {
      const { left, right } = this.nodify(tree);
      f && f(tree.root, i++, tree);
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
      tree: SubtreeNode | LeafNode
    ) => void
  ) {
    let i = 0;
    const t = (tree: SubtreeNode | LeafNode) => {
      const { left, right } = this.nodify(tree);
      left.map((n) => t(n));
      right.map((n) => t(n));
      f && f(tree.root, i++, tree);
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
      tree: SubtreeNode | LeafNode
    ) => void
  ) {
    let i = 0;
    const t = (tree: TNode) => {
      const { left, right } = this.nodify(tree);
      left.map((n) => t(n));
      f && f(tree.root, i++, tree);
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
    f?: (
      node: LeafNode,
      level: number,
      tree: SubtreeNode | LeafNode
    ) => void
  ) {
    const queue = linkedList<TNode>(this.data);
    const result: QueuedNode[] = [];
    let cnt = queue.length;
    let level = 0;
    while (queue.length > 0) {
      const tree = queue.shift();
      cnt--;
      if (tree === null) {
        continue;
      }
      const node = tree.root;
      const C = tree.children.length;
      result.push({ node, level, tree });
      for (let i = 0; i < C; i++) {
        queue.push(tree.children[i]);
      }
      if (cnt === 0) {
        level++;
        cnt = queue.length;
      }
    }
    if (f) {
      result.forEach(({ node, level, tree }) =>
        f(node, level, tree)
      );
    }
    queue.clear();
    return this;
  }
}

class SubTree {
  children: (SubtreeNode | LeafNode)[] = [];
  get thread() {
    return this.root.thread;
  }
  set thread(node: TNode | null) {
    this.root.thread = node;
  }
  get degree() {
    return this.children.length;
  }
  set hx(value: number) {
    this.root.hx = value;
  }
  get hx() {
    return this.root.hx;
  }
  get depth() {
    return this.root.depth;
  }
  set depth(value: number) {
    this.root.depth = value;
  }
  onParent(f: (parent: LeafNode) => void) {
    this.root.parent && f(this.root.parent);
  }
  root: LeafNode;
  constructor(name: string) {
    this.root = leaf(name);
    this.root.height = 0;
  }
  childOf(node: LeafNode) {
    this.root.parent = node;
    return this;
  }
  get index() {
    return this.root.index;
  }

  set index(value: number) {
    this.root.index = value;
  }

  private push(node: SubtreeNode | LeafNode) {
    node.childOf(this.root);
    if (isSubtreeNode(node)) {
      const max = this.root.height - 1;
      const nodeheight = node.root.height;
      if (nodeheight >= max) {
        this.root.height = node.root.height + 1;
      }
    } else this.root.height = 1;
    node.index = this.degree;
    this.children.push(node);
  }

  name() {
    return this.root.name();
  }

  branch(node: SubtreeNode) {
    this.push(node);
    return this;
  }

  leaf(name: string | number) {
    const child = leaf(name);
    this.push(child);
    return this;
  }

  node(
    treeNode: string | number | LeafNode | SubtreeNode
  ): this {
    if (
      typeof treeNode === "string" ||
      typeof treeNode === "number"
    ) {
      const child = leaf(treeNode);
      this.push(child);
    } else {
      this.push(treeNode);
    }
    return this;
  }
}

class Leaf {
  value: string;
  children: (SubtreeNode | LeafNode)[] = [];
  parent: LeafNode | null = null;
  r: number = 5;
  hx: number = 0;
  index: number = 0;
  depth: number = 0;
  height: number = 0;
  thread: TNode | null = null;
  get degree() {
    return 0;
  }
  onParent(f: (parent: LeafNode) => void) {
    this.parent && f(this.parent);
  }
  get root() {
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
  childOf(node: LeafNode) {
    this.parent = node;
    return this;
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

export const isLeafNode = (
  node: FigNode
): node is LeafNode => {
  if (unsafe(node)) return false;
  return node.type === "leaf";
};

const SUBTREE_NODE = typed(colorable(spatial2D(SubTree)));
export const subtree = (name: string | number) => {
  return new SUBTREE_NODE(`${name}`).typed("subtree");
};
export type SubtreeNode = ReturnType<typeof subtree>;
export const isSubtreeNode = (
  node: FigNode
): node is SubtreeNode => {
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
export const tree = (name: string | number) => {
  return new TREE_NODE(`${name}`).typed("tree");
};

export type TreeNode = ReturnType<typeof tree>;

export const isTreeNode = (
  node: FigNode
): node is TreeNode => {
  if (unsafe(node)) return false;
  return node.type === "tree";
};
