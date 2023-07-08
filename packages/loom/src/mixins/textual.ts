import { And, Axiom, Space2D } from "../index.js";

export interface Textual {
  text: string|number;
  space: () => Space2D;
  scope(space: Space2D): this;
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
  write(text:string): this;
}

export function textual<NodeClass extends Axiom>(
  nodetype: NodeClass
): And<NodeClass, Textual> {
  return class extends nodetype {
    text: string = "";
    write(text:string) {
      this.text=text;
      return this;
    }
    space: () => Space2D = () => new Space2D();
    scope(space: Space2D) {
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
          this.FontFamily = value;
          break;
        case "size":
          this.FontSize = value;
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
