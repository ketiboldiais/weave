import { unsafe } from "./aux.js";
import { FigNode } from "./node.types.js";
import { RadialPoint } from "./point.js";
import { textual } from "./textual.js";
import { typed } from "./typed.js";

const TEXT = typed(textual(RadialPoint));

export class Text extends TEXT {
  constructor(content: string) {
    super(content);
    this.type = "text";
  }
}

export const label = (content: string | number) => {
  return new Text(`${content}`);
};
export const tex = (content: string | number) =>
  label(`${content}`).format("latex-inline");
export const latex = (content: string | number) =>
  label(`${content}`).format("latex-block");
export type TextNode = ReturnType<typeof label>;
export const isTextNode = (
  node: FigNode
): node is TextNode => {
  if (unsafe(node)) return false;
  return node.type === "text";
};
