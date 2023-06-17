import { unsafe } from "./aux.js";
import { FigNode } from "./node.types.js";
import { Circle } from "./circle.js";
import { textual } from "./textual.js";
import { typed } from "./typed.js";

const TEXT = typed(textual(Circle));

export class Text extends TEXT {
  constructor(content: string) {
    super(content);
    this.type = "text";
    this.text=content;
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
