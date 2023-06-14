import { And, Axiom, Space } from "./index.js";

export interface Textual {
  content: string;
  space: () => Space;
  scope(space: Space): this;
  FontColor?: string;
  FontFamily?: string;
  FontSize?: string;
  font(
    prop: "color" | "family" | "size",
    value: string
  ): this;
  anchor?: "middle" | "start" | "end";
  textAnchor(anchor: "middle" | "start" | "end"): this;
  mode: "normal" | "latex-inline" | "latex-block";
  format(
    value: "normal" | "latex-inline" | "latex-block"
  ): this;
}

export function textual<NodeClass extends Axiom>(
  nodetype: NodeClass
): And<NodeClass, Textual> {
  return class extends nodetype {
    content: string = "";
    space: () => Space = () => new Space();
    scope(space: Space) {
      this.space = () => space;
      return this;
    }
    FontColor?: string;
    FontFamily?: string;
    FontSize?: string;
    font(prop: "color" | "family" | "size", value: string) {
      // deno-fmt-ignore
      switch (prop) {
        case "color":
          this.FontColor = value;
          break;
        case "family":
          this.FontSize = value;
          break;
        case "size":
          this.FontFamily = value;
          break;
      }
      return this;
    }
    anchor?: "middle" | "start" | "end";
    textAnchor(anchor: "middle" | "start" | "end") {
      this.anchor = anchor;
      return this;
    }
    mode: "normal" | "latex-inline" | "latex-block" =
      "normal";
    format(
      value: "normal" | "latex-inline" | "latex-block"
    ) {
      this.mode = value;
      return this;
    }
  };
}
