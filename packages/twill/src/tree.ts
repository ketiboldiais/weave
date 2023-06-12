import { arraySplit, unsafe } from "./aux.js";
import {
  AxisNode,
  FigNode,
  label,
  line,
  LineNode,
  link,
  LinkNode,
  Space,
  TextNode,
} from "./index.js";
import { LinkedList, linkedList } from "./list.js";
import { subtree } from "./treenodes.js";
import type {
  LeafNode,
  SubtreeNode,
  TreeChild,
} from "./treenodes.js";
import { typed } from "./typed.js";

type TreeLayout =
  | "knuth"
  | "wetherell-shannon"
  | "reingold-tilford";

type TreeNote = TextNode | LineNode;

type LineFn = (line: LineNode) => TreeNote;

type EdgeNotes = {
  ["preorder-traversal"]: LineFn;
  ["inorder-traversal"]: LineFn;
  ["postorder-traversal"]: LineFn;
  ["bfs-traversal"]: LineFn;
  ["contour-left"]: LineFn;
  ["contour-right"]: LineFn;
  ["threads"]: LineFn;
};

export type TreeData = {
  nodes: LeafNode[];
  edges: LinkNode[];
  notes: (TextNode | AxisNode | LineNode)[];
};

class Tree extends Space {
  private tree: SubtreeNode;

  constructor(label: string) {
    super();
    this.tree = subtree(label);
  }

  private nodemapFn?: {
    f: (n: LeafNode, index: number) => LeafNode;
    order: "preorder" | "inorder" | "postorder" | "bfs";
  };

  /**
   * Given a traversal order, applies the provided callback
   * to each node visited.
   */
  nodemap(
    order: "preorder" | "inorder" | "postorder" | "bfs",
    callback: (n: LeafNode, index: number) => LeafNode
  ) {
    this.nodemapFn = { f: callback, order };
    return this;
  }

  children: (TextNode | AxisNode | LineNode)[] = [];

  and(nodes: (TextNode | AxisNode | LineNode)[]) {
    const current = this.children;
    this.children = [...current, ...nodes];
    return this;
  }
  nodeNote?: (node: LeafNode) => TextNode | string | number;

  /**
   * Given the provided callback adds a text
   * annotation to each node.
   */
  forEachNode(
    callback: (node: LeafNode) => TextNode | string | number
  ) {
    this.nodeNote = callback;
    return this;
  }

  private notes: Partial<EdgeNotes> = {};

  onPath(
    option: keyof EdgeNotes,
    f: (line: LineNode) => TreeNote = (line) => line
  ) {
    this.notes[option] = f;
    return this;
  }

  private layout: TreeLayout = "knuth";

  ala(option: TreeLayout) {
    this.layout = option;
    return this;
  }

  nodes(children: (LeafNode | SubtreeNode)[]) {
    this.tree.nodes(children);
    return this;
  }

  bfs(f: (node: LeafNode, level: number) => void) {
    const queue = linkedList<TreeChild>(this.tree);
    let count = queue.length;
    let level = 0;
    while (queue.length > 0) {
      const tree = queue.shift();
      count--;
      if (!tree) continue;
      f(tree.root, level);
      tree.forEach((child) => {
        queue.push(child);
      });
      if (count === 0) {
        level++;
        count = queue.length;
      }
    }
    queue.clear();
    return this;
  }

  private postorder(
    f: (node: LeafNode, index: number) => void
  ) {
    let i = 0;
    const t = (tree: TreeChild) => {
      const [left, right] = arraySplit(tree.children);
      left.forEach((c) => t(c));
      right.forEach((c) => t(c));
      f(tree.root, i++);
    };
    t(this.tree);
    return this;
  }

  private preorder(
    f: (node: LeafNode, index: number) => void
  ) {
    let i = 0;
    const t = (tree: TreeChild) => {
      const [left, right] = arraySplit(tree.children);
      f(tree.root, i++);
      left.forEach((c) => t(c));
      right.forEach((c) => t(c));
    };
    t(this.tree);
    return this;
  }
  private inorder(
    f: (node: LeafNode, index: number) => void
  ) {
    let i = 0;
    const t = (tree: TreeChild) => {
      const [left, right] = arraySplit(tree.children);
      left.forEach((c) => t(c));
      f(tree.root, i++);
      right.forEach((c) => t(c));
    };
    t(this.tree);
    return this;
  }

  private bfsNote(f: (lf: LineFn) => void) {
    if (this.notes["bfs-traversal"]) {
      const lineFn = this.notes["bfs-traversal"];
      return f(lineFn);
    }
  }

  private inorderNote(f: (lf: LineFn) => void) {
    if (this.notes["inorder-traversal"]) {
      const lineFn = this.notes["inorder-traversal"];
      return f(lineFn);
    }
  }

  private postorderNote(f: (lf: LineFn) => void) {
    if (this.notes["postorder-traversal"]) {
      const lineFn = this.notes["postorder-traversal"];
      return f(lineFn);
    }
  }
  private preorderNote(f: (lf: LineFn) => void) {
    if (this.notes["preorder-traversal"]) {
      const lineFn = this.notes["preorder-traversal"];
      return f(lineFn);
    }
  }

  private contourRightNote(f: (lf: LineFn) => void) {
    if (this.notes["contour-right"]) {
      const lineFn = this.notes["contour-right"];
      return f(lineFn);
    }
  }

  private contourLeftNote(f: (lf: LineFn) => void) {
    if (this.notes["contour-left"]) {
      const lineFn = this.notes["contour-left"];
      return f(lineFn);
    }
  }

  figure() {
    const currentNotes = this.children;
    const output: TreeData = {
      nodes: [],
      edges: [],
      notes: [...currentNotes],
    };
    const layout = this.layout;

    const lt = (a: TreeChild, b: TreeChild) => {
      return a.root.x < b.root.x;
    };
    const gt = (a: TreeChild, b: TreeChild) => {
      return a.root.x > b.root.x;
    };

    const contour = (
      tree: TreeChild,
      compare: (x: TreeChild, y: TreeChild) => boolean,
      level: number = 0,
      cont: LinkedList<LeafNode> | null = null
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
      tree.children.forEach((c) => {
        return contour(c, compare, level + 1, cont);
      });
      return cont;
    };

    const wetherellShannon = () => {
      const lay = (
        tree: TreeChild,
        depth: number,
        nexts: number[] = [0],
        offsets: number[] = [0]
      ) => {
        tree.children.forEach((c) => {
          lay(c, depth + 1, nexts, offsets);
        });
        tree.root.y = -depth;
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
          x = tree.children[0].root.x - 1;
        }
        if (tree.degree > 1) {
          let Lx = 0;
          tree.onFirstChild((n) => {
            Lx = n.x;
          });
          let Rx = 0;
          tree.onLastChild((n) => {
            Rx = n.x;
          });
          const xDistance = Lx + Rx;
          x = xDistance / 2;
        }

        offsets[depth] = Math.max(
          offsets[depth],
          nexts[depth] - x
        );

        if (tree.degree !== 0) {
          const d = x + offsets[depth];
          tree.root.x = d;
        } else {
          tree.root.x = x;
        }

        nexts[depth] += 2;

        tree.root.dx = offsets[depth];
      };

      const addHxs = (tree: TreeChild, sum: number = 0) => {
        tree.root.x = tree.root.x + sum;
        sum += tree.root.dx;
        tree.children.forEach((c) => addHxs(c, sum));
      };

      lay(this.tree, 0);
      addHxs(this.tree);
    };

    const knuth = () => {
      this.bfs((node, level) => {
        const y = 0 - level;
        node.y = y;
        node.depth = level;
      });
      this.inorder((node, index) => {
        node.x = index;
      });
    };
    if (layout === "knuth") {
      knuth();
    } else if (layout === "wetherell-shannon") {
      wetherellShannon();
    }

    if (this.nodemapFn !== undefined) {
      const { f, order } = this.nodemapFn;
      this[order]((node, index) => {
        f(node, index);
      });
    }
    this.bfs((node) => {
      output.nodes.push(node);
      if (node.parent) {
        const p = node.parent;
        output.edges.push(link(node, p.root));
      }
    });
    this.bfsNote((lineFn) => {
      const list = linkedList<LeafNode>();
      this.bfs((node) => {
        list.push(node.root);
      });
      list
        .zip(list.cdr())
        .map(([a, b]) =>
          output.notes.push(
            lineFn(line(a.x, a.y, b.x, b.y))
          )
        );
    });
    this.postorderNote((lineFn) => {
      const list = linkedList<LeafNode>();
      this.postorder((node) => {
        list.push(node.root);
      });
      list
        .zip(list.cdr())
        .map(([a, b]) =>
          output.notes.push(
            lineFn(line(a.x, a.y, b.x, b.y))
          )
        );
    });
    this.inorderNote((lineFn) => {
      const list = linkedList<LeafNode>();
      this.inorder((node) => {
        list.push(node.root);
      });
      list
        .zip(list.cdr())
        .map(([a, b]) =>
          output.notes.push(
            lineFn(line(a.x, a.y, b.x, b.y))
          )
        );
    });
    this.preorderNote((lineFn) => {
      const list = linkedList<LeafNode>();
      this.preorder((node) => {
        list.push(node.root);
      });
      list
        .zip(list.cdr())
        .map(([a, b]) =>
          output.notes.push(
            lineFn(line(a.x, a.y, b.x, b.y))
          )
        );
    });
    this.contourLeftNote((lfn) => {
      const list = contour(this.tree, gt);
      list
        .zip(list.cdr())
        .map(([a, b]) =>
          output.notes.push(lfn(line(a.x, a.y, b.x, b.y)))
        );
    });
    this.contourRightNote((lfn) => {
      const list = contour(this.tree, lt);
      list
        .zip(list.cdr())
        .map(([a, b]) =>
          output.notes.push(lfn(line(a.x, a.y, b.x, b.y)))
        );
    });
    if (this.nodeNote) {
      const c = this.nodeNote;
      output.nodes.forEach((node) => {
        const note = c(node);
        if (
          typeof note === "string" ||
          typeof note === "number"
        ) {
          output.notes.push(
            label(`${note}`)
              .position("x", node.x)
              .position("y", node.y)
          );
        } else output.notes.push(note);
      });
    }
    if (this.notes["threads"]) {
    }
    return output;
  }
}

const treenode = typed(Tree);
export const tree = (label: string) => {
  return new treenode(`${label}`).typed("tree");
};
export type TreeNode = ReturnType<typeof tree>;
export const isTree = (node: FigNode): node is TreeNode =>
  !unsafe(node) && node.isType("tree");
