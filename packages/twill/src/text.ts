import { unsafe } from "./aux.js";
import { FigNode } from "./node.types.js";
import { Space } from "./space.js";
import { spatial2D } from "./spatial2D.js";
import { typed } from "./typed.js";

export class Text {
  content: string;
  space: () => Space = () => new Space();
  scope(space: Space) {
    this.space = () => space;
    return this;
  }
  constructor(content: string) {
    this.content = content;
  }
  FontColor?: string;
  FontFamily?: string;
  FontSize?: string;
  font(prop: "color" | "family" | "size", value: string) {
    // deno-fmt-ignore
    switch (prop) {
			case 'color': this.FontColor=value; break;
			case 'family': this.FontSize=value; break;
			case 'size': this.FontFamily=value; break;
		}
    return this;
  }
  anchor?: "middle" | "start" | "end";
  textAnchor(anchor: "middle" | "start" | "end") {
    this.anchor = anchor;
    return this;
  }
  mode: "normal" | "latex-inline" | "latex-block" = "normal";
  format(value: "normal" | "latex-inline" | "latex-block") {
    this.mode = value;
    return this;
  }
}

export const label = (content: string) => {
  const fig = typed(spatial2D(Text));
  return new fig(content).typed("text");
};
export const tex = (content: string) => label(content).format("latex-inline");
export const latex = (content: string) => label(content).format("latex-block");
export type TextNode = ReturnType<typeof label>;
export const isTextNode = (node: FigNode): node is TextNode => {
  if (unsafe(node)) return false;
  return node.type === "text";
};
