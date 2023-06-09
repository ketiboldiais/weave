import { unsafe } from "./aux.js";
import { FigNode } from "./index.js";
import { Circle } from "./geometries/circle.js";
import { textual } from "./mixins/textual.js";
import { typed } from "./mixins/typed.js";

const TEXT = typed(textual(Circle));

export class Text extends TEXT {
  constructor(content: string|number) {
    super(0);
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
): node is TextNode => (
  !unsafe(node) && node.isType('text')
)
