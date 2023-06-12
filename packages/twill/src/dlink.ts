import { LeafNode, FigNode } from "./index.js";
import { unsafe } from "./aux.js";
import { colorable } from "./colorable.js";
import { typed } from "./typed.js";

export type Linkable = LeafNode;
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
