import { unsafe } from "./aux.js";
import {
  FigNode,
  LineNode,
  Space,
  arrowDef,
  line,
} from "./index.js";
import { linkedList } from "./list.js";
import {
  Tree,
  TreeChild,
  leaf,
  subtree,
} from "./treenode.js";
import { typed } from "./typed.js";

type TreeLayout =
  | "knuth"
  | "wetherell-shannon"
  | "reingold-tilford";
type Traversal =
  | "preorder"
  | "inorder"
  | "postorder"
  | "bfs";
type LinkFunction = (
  line: LineNode,
  source: TreeChild,
  target: TreeChild
) => LineNode;
class TreeSpace extends Space {
  tree: Tree;
  layout: TreeLayout = "knuth";
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
  }
  nodes(nodes: TreeChild[]) {
    nodes.forEach((n) => this.tree.child(n));
    return this;
  }
  private reingoldTilford() {
    this.wetherellShannon();
		
  }

  private wetherellShannon() {
    const lay = (
      tree: TreeChild,
      depth: number,
      nexts: number[] = [0],
      offsets: number[] = [0]
    ) => {
      tree.children.forEach((c) => {
        lay(c, depth + 1, nexts, offsets);
      });
      tree.y(-depth);
      if (nexts[depth] === undefined) {
        nexts[depth] = 0;
      }
      if (offsets[depth] === undefined) {
        offsets[depth] = 0;
      }
      let x = nexts[depth];
      if (tree.degree === 0) {
        x = nexts[depth];
        tree.x(x);
      } else if (tree.degree === 1) {
        x = tree.children[0].cx + 1;
      } else {
        let lx = 0;
        tree.onFirstChild((n) => {
          lx = n.cx;
        });
        let rx = 0;
        tree.onLastChild((n) => {
          rx = n.cx;
        });
        const X = lx + rx;
        x = X / 2;
      }
      offsets[depth] = Math.max(
        offsets[depth],
        nexts[depth] - x
      );
      if (tree.degree !== 0) {
        const d = x + offsets[depth];
        tree.x(d);
      } else {
        tree.x(x);
      }
      nexts[depth] += 2;
      tree.dx = offsets[depth];
    };
    const addDXs = (tree: TreeChild, sum: number = 0) => {
      tree.x(tree.cx + sum);
      sum += tree.dx;
      tree.children.forEach((c) => addDXs(c, sum));
    };
    lay(this.tree, 0);
    addDXs(this.tree);
		const x = this.tree.cx;
		this.tree.bfs(n => {
			n.cx-=x;
		})
  }
  private knuth() {
    this.tree.bfs((node, level) => {
      const y = 0 - level;
      node.y(y);
    });
    this.tree.inorder((node, index) => {
      node.x(index);
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
    }
  }
  figure() {
    this.lay();
    const nodes: TreeChild[] = [];
    const edges: LineNode[] = [];
    this.tree.bfs((node) => nodes.push(node));
    this.tree.bfs((node) => {
      const parent = node.parent;
      if (parent) {
        const l = line(
          parent.cx,
          parent.cy,
          node.cx,
          node.cy
        );
        edges.push(l);
      }
    });
    const edgeNotes: LineNode[] = [];
    const markEdge = (
      option: Traversal,
      callback: LinkFunction
    ) => {
      const list = linkedList<TreeChild>();
      this.tree[option]((node) => {
        list.push(node);
      });
      const rest = list.cdr();
      list.zip(rest).forEach(([a, b]) => {
        const l = line(a.cx, a.cy, b.cx, b.cy)
          .arrow("end")
          .opacity(0.5)
          .weight(0.9);
        const c = callback(l, a, b).uid(l.id);
        const arrow = arrowDef().uid(c.id).copyColors(c);
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
    return { nodes, edges, edgeNotes };
  }
}

const TREESPACE = typed(TreeSpace);

export const tree = (name: string) => {
  return new TREESPACE(subtree(name)).typed("tree");
};
export const isTreeSpace = (
  node: FigNode
): node is TreeSpaceNode =>
  !unsafe(node) && node.isType("tree");
export type TreeSpaceNode = ReturnType<typeof tree>;
