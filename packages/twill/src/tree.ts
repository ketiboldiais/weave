import { tuple, unsafe } from "./aux.js";
import { arrowDef, FigNode, Line, line, Space } from "./index.js";
import { linkedList } from "./list.js";
import { subtree, Tree, TreeChild } from "./treenode.js";
import { typed } from "./typed.js";

type TreeLayout =
  | "knuth"
  | "wetherell-shannon"
  | "buccheim-unger-leipert"
  | "reingold-tilford";
type Traversal =
  | "preorder"
  | "inorder"
  | "postorder"
  | "bfs";
type LinkFunction = (
  line: Line,
  source: TreeChild,
  target: TreeChild,
) => Line;
const TREEBASE = typed(Space);

export class TreeSpace extends TREEBASE {
  tree: Tree;
  layout: TreeLayout = "knuth";
  /**
   * Sets the layout algorithm for this tree.
   * Valid options include:
   * 1. `knuth` - The default option,
   *    drawing the tree using Knuth’s algorithm.
   *    This the fastest algorithm among the options, but
   *    ignores any possible collisions between subtrees.
   *    This algorithm should only be used on binary trees
   *    (trees with a maximum of two child nodes), as it
   *    it isn’t designed to handle n-ary trees. Knuth’s
   *    algorithm is best-suited for perfect binary trees, running
   *    in O(n) time and O(1) memory.
   * 2. `wetherell-shannon` - Draws the tree using the Wetherell-Shannon
   *    algorithm. The algorithm takes possible collisions into consideration,
   *    offsetting as needed. While the algorithm is designed for binary trees,
   *    it can handle n-ary trees, but with increased risks of collision. Because
   *    the algorithm doesn’t consider the position of neighboring trees,
   *    degenerate subtrees have a high risk of collision. The algorithm also
   *    consumes more horizontal space as compared to the Reingold-Tilford
   *    algorithm. The Wetherell-Shannon algorithm is best suited
   *    for complete binary trees. The algorithm runs on O(n) time and O(n) memory.
   * 3. `reingold-tilford` - Draws the tree using the Reingold-Tilford algorithm.
   *    This is arguably the best algorithm for drawing binary trees, given its
   *    consideration for the relative positions of neighboring subtrees. This
   *    algorithm, however, is _not_ designed to handle n-ary trees. Reingold-Tilford’s
   *    algorithm runs on O(n) time and O(n) memory.
   * 4. `buccheim-unger-leipert` - Draws the tree using the Buccheim-Unger-Leipert algorithm.
   *    This algorithm should be used if the tree is an n-ary tree. Although the algorithm
   *    runs in O(n) time, it is the least performant of the four, having to perform at least
   *    four traversals to tidy the tree.
   */
  ala(option: TreeLayout) {
    this.layout = option;
    return this;
  }
  private edgeNotes: Partial<
    Record<Traversal, LinkFunction>
  > = {};
  edges(of: Traversal, callback: LinkFunction) {
    this.edgeNotes[of] = callback;
    return this;
  }
  constructor(tree: Tree) {
    super();
    this.tree = tree;
    this.type = "tree";
  }
  nodes(nodes: TreeChild[]) {
    nodes.forEach((n) => this.tree.child(n));
    return this;
  }

  private buccheim() {
    const leftBrother = (self: TreeChild) => {
      let n = null;
      if (self.parent) {
        for (const node of self.parent.children) {
          if (node.id === self.id) return n;
          else n = node;
        }
      }
      return n;
    };
    const get_lmost_sibling = (self: TreeChild) => {
      if (
        !self.leftmost_sibling &&
        self.parent &&
        self.id != self.parent.children[0].id
      ) {
        self.leftmost_sibling = self.parent.children[0];
        return self.parent.children[0];
      }
      return self.leftmost_sibling;
    };
    const movesubtree = (
      wl: TreeChild,
      wr: TreeChild,
      shift: number,
    ) => {
      const st = wr.index - wl.index;
      wr.change -= shift / st;
      wr.shift += shift;
      wl.change += shift / st;
      wr.x += shift;
      wr.dx += shift;
    };
    const ancestor = (
      vil: TreeChild,
      v: TreeChild,
      default_ancestor: TreeChild,
    ) => {
      if (v.parent && v.parent.hasChild(vil.id)) {
        return vil.ancestor;
      }
      return default_ancestor;
    };
    const apportion = (
      v: TreeChild,
      default_ancestor: TreeChild,
      distance: number,
    ) => {
      const w = leftBrother(v);
      let vol = get_lmost_sibling(v);
      if (w !== null && vol !== null) {
        let vir = v;
        let vor = v;
        let vil = w;
        let sir = v.dx;
        let sor = v.dx;
        let sil = vil.dx;
        let sol = vol.dx;
        let VIL: TreeChild | null = vil;
        let VIR: TreeChild | null = vir;
        let VOL: TreeChild | null = vol;
        let VOR: TreeChild | null = vor;
        while (VIL?.right() && VIR?.left()) {
          VIL = vil.right();
          if (VIL) vil = VIL;
          VIR = vir.left();
          if (VIR) vir = VIR;
          VOL = vol.left();
          if (VOL) vol = VOL;
          VOR = vor.right();
          if (VOR) {
            vor = VOR;
            vor.ancestor = v;
          }
          let shift = (vil.x + sil) - (vir.x + sir) + distance;
          if (shift > 0) {
            let a = ancestor(vil, v, default_ancestor);
            movesubtree(a, v, shift);
            sir = sir + shift;
            sor = sor + shift;
          }
          sil += vil.dx;
          sir += vir.dx;
          sol += vol.dx;
          sor += vor.dx;
        }
        if (vil.right() && !vor.right()) {
          vor.thread = vil.right();
          vor.dx += sil - sor;
        } else {
          if (vir.left() && !vol.left()) {
            vol.thread = vir.left();
            vol.dx += sir - sol;
          }
          default_ancestor = v;
        }
      }
      return default_ancestor;
    };
    const execShifts = (v: TreeChild) => {
      let shift = 0;
      let change = 0;
      for (const w of v.children) {
        w.x += shift;
        w.dx += shift;
        change += w.change;
        shift += w.shift + change;
      }
    };
    const firstwalk = (
      v: TreeChild,
      distance: number = 1,
    ) => {
      if (v.children.length === 0) {
        if (v.leftmost_sibling) {
          const lb = leftBrother(v);
          if (lb) v.x = lb.x + distance;
        } else v.x = 0;
      } else {
        let default_ancestor = v.children[0];
        for (const w of v.children) {
          firstwalk(w);
          default_ancestor = apportion(
            w,
            default_ancestor,
            distance,
          );
        }
        execShifts(v);
        const L = v.children[0];
        const R = v.children[v.children.length - 1];
        let midpoint = (L.x + R.x) / 2;
        const w = leftBrother(v);
        if (w) {
          v.x = w.x + distance;
          v.dx = v.x - midpoint;
        } else {
          v.x = midpoint;
        }
      }
      return v;
    };
    const secondwalk = (
      v: TreeChild,
      m: number = 0,
      depth: number = 0,
      min: number | null = null,
    ): number => {
      v.x += m;
      v.y = -depth;
      if (min === null || v.x < min) {
        min = v.x;
      }
      for (const w of v.children) {
        min = secondwalk(w, m + v.dx, depth + 1, min);
      }
      return min;
    };
    const thirdwalk = (tree: TreeChild, n: number) => {
      tree.x += n;
      for (const w of tree.children) {
        thirdwalk(w, n);
      }
    };
    const buccheim = () => {
      this.tree.sketch();
      firstwalk(this.tree);
      const min = secondwalk(this.tree);
      if (min < 0) {
        thirdwalk(this.tree, -min);
      }
    };
    buccheim();
    const x = this.tree.x;
    this.tree.bfs((n) => {
      n.x -= x;
    });
  }

  private reingoldTilford() {
    const contour = (
      left: TreeChild,
      right: TreeChild,
      max_offset: number | null = null,
      left_offset: number = 0,
      right_offset: number = 0,
      left_outer: TreeChild | null = null,
      right_outer: TreeChild | null = null,
    ): [
      TreeChild | null,
      TreeChild | null,
      number,
      number,
      number,
      TreeChild,
      TreeChild,
    ] => {
      let delta = left.x + left_offset - (right.x + right_offset);
      if (max_offset === null || delta > max_offset) {
        max_offset = delta;
      }
      if (left_outer === null) left_outer = left;
      if (right_outer === null) right_outer = right;
      let lo = left_outer.left();
      let li = left.right();
      let ri = right.left();
      let ro = right_outer.right();
      if (li && ri) {
        left_offset += left.dx;
        right_offset += right.dx;
        return contour(
          li,
          ri,
          max_offset,
          left_offset,
          right_offset,
          lo,
          ro,
        );
      }
      const out = tuple(
        li,
        ri,
        max_offset,
        left_offset,
        right_offset,
        left_outer,
        right_outer,
      );
      return out;
    };
    const fixSubtrees = (
      left: TreeChild,
      right: TreeChild,
    ) => {
      let [li, ri, diff, loffset, roffset, lo, ro] = contour(left, right);
      diff += 1;
      diff += (right.x + diff + left.x) % 2;
      right.dx = diff;
      right.x += diff;
      if (right.children.length) {
        roffset += diff;
      }
      if (ri && !li) {
        lo.thread = ri;
        lo.dx = roffset - loffset;
      } else if (li && !ri) {
        ro.thread = li;
        ro.dx = loffset - roffset;
      }
      const out = Math.floor((left.x + right.x) / 2);
      return out;
    };
    const addmods = (tree: TreeChild, mod: number = 0) => {
      tree.x += mod;
      tree.children.forEach((c) => addmods(c, mod + tree.dx));
      return tree;
    };
    const setup = (tree: TreeChild, depth: number = 0) => {
      tree.sketch(-depth);
      if (tree.children.length === 0) {
        tree.x = 0;
        return tree;
      }
      if (tree.children.length === 1) {
        tree.x = setup(tree.children[0], depth + 1).x;
        return tree;
      }
      const left = setup(tree.children[0], depth + 1);
      const right = setup(tree.children[1], depth + 1);
      tree.x = fixSubtrees(left, right);
      return tree;
    };
    setup(this.tree);
    addmods(this.tree);
    let x = this.tree.x;
    this.tree.bfs((n) => {
      n.x -= x;
    });
  }

  private wetherellShannon() {
    const lay = (
      tree: TreeChild,
      depth: number,
      nexts: number[] = [0],
      offsets: number[] = [0],
    ) => {
      tree.children.forEach((c) => {
        lay(c, depth + 1, nexts, offsets);
      });
      tree.y = -depth;
      if (nexts[depth] === undefined) {
        nexts[depth] = 0;
      }
      if (offsets[depth] === undefined) {
        offsets[depth] = 0;
      }
      let x = nexts[depth];
      if (tree.degree === 0) {
        x = nexts[depth];
        tree.x = x;
      } else if (tree.degree === 1) {
        x = tree.children[0].x + 1;
      } else {
        let lx = 0;
        tree.onFirstChild((n) => {
          lx = n.x;
        });
        let rx = 0;
        tree.onLastChild((n) => {
          rx = n.x;
        });
        const X = lx + rx;
        x = X / 2;
      }
      offsets[depth] = Math.max(
        offsets[depth],
        nexts[depth] - x,
      );
      if (tree.degree !== 0) {
        const d = x + offsets[depth];
        tree.x = d;
      } else {
        tree.x = x;
      }
      nexts[depth] += 2;
      tree.dx = offsets[depth];
    };
    const addDXs = (tree: TreeChild, sum: number = 0) => {
      tree.x = tree.x + sum;
      sum += tree.dx;
      tree.children.forEach((c) => addDXs(c, sum));
    };
    lay(this.tree, 0);
    addDXs(this.tree);
    const x = this.tree.x;
    this.tree.bfs((n) => {
      n.x -= x;
    });
  }
  private knuth() {
    this.tree.bfs((node, level) => {
      const y = 0 - level;
      node.y = y;
    });
    this.tree.inorder((node, index) => {
      node.x = index;
    });
    const x = this.tree.x;
    this.tree.bfs((n) => {
      n.x -= x;
    });
    return this;
  }
  private lay() {
    const layout = this.layout;
    if (layout === "knuth") {
      this.knuth();
    } else if (layout === "wetherell-shannon") {
      this.wetherellShannon();
    } else if (layout === "reingold-tilford") {
      this.reingoldTilford();
    } else if (layout === "buccheim-unger-leipert") {
      this.buccheim();
    }
  }
  figure() {
    this.lay();
    const nodes: TreeChild[] = [];
    const edges: Line[] = [];
    const edgeNotes: Line[] = [];
    this.tree.bfs((node) => {
      nodes.push(node);
    });
    this.tree.bfs((node) => {
      const parent = node.parent;
      if (parent) {
        const l = line(
          [parent.x, parent.y],
          [node.x, node.y],
        );
        edges.push(l);
      }
    });
    const markEdge = (
      option: Traversal,
      callback: LinkFunction,
    ) => {
      const list = linkedList<TreeChild>();
      this.tree[option]((node) => {
        list.push(node);
      });
      const rest = list.cdr();
      list.zip(rest).forEach(([a, b]) => {
        const r = 1 / b.r + 0.05;
        const gamma = b.gamma(a);
        const ox = Math.cos(gamma) * r;
        const oy = Math.sin(gamma) * r;
        const tx = b.x - (b.x < 0 ? ox : ox);
        const ty = b.y - (b.y < 0 ? oy : oy);
        const l = line([a.x, a.y], [tx, ty]).arrow("end");
        const c = callback(l, a, b).uid(l.id);
        const arrow = arrowDef()
          .uid(c.id)
          .ref("x", b.r * 2)
          .sized(b.r, b.r)
          .viewbox(`0 -${b.r} ${b.r * 2} ${b.r * 2}`)
          .path(`M0,-${b.r}L${b.r * 2},0L0,${b.r}Z`)
          .copyColors(c);
        edgeNotes.push(c);
        this.define(arrow);
      });
      list.clear();
    };
    if (this.edgeNotes["inorder"]) {
      markEdge("inorder", this.edgeNotes["inorder"]);
    }
    if (this.edgeNotes["bfs"]) {
      markEdge("bfs", this.edgeNotes["bfs"]);
    }
    if (this.edgeNotes["postorder"]) {
      markEdge("postorder", this.edgeNotes["postorder"]);
    }
    if (this.edgeNotes["preorder"]) {
      markEdge("preorder", this.edgeNotes["preorder"]);
    }
    const out = { nodes, edges, edgeNotes };
    return out;
  }
}

export const tree = (name: string) => {
  return new TreeSpace(subtree(name)).typed("tree");
};
export const isTreeSpace = (
  node: FigNode,
): node is TreeSpace => !unsafe(node) && node.isType("tree");
