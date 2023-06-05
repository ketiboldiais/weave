import { spatial2D } from "./spatial2D.js";
import { typed } from "./typed.js";

export class Text {
  content: string;
  constructor(content: string) {
    this.content = content;
  }

  FontColor: string = "currentColor";
  FontFamily: string = "inherit";
  FontSize: string = "0.8rem";

  font(prop: "color" | "family" | "size", value: string) {
    // deno-fmt-ignore
    switch (prop) {
			case 'color': this.FontColor=value; break;
			case 'family': this.FontSize=value; break;
			case 'size': this.FontFamily=value; break;
		}
    return this;
  }

  anchor: "middle" | "start" | "end" = "middle";
  textAnchor(anchor: "middle" | "start" | "end") {
    this.anchor = anchor;
    return this;
  }
  mode: "normal" | "latex" = "normal";
  format(value: "normal" | "latex") {
    this.mode = value;
    return this;
  }
}

export const label = (content: string) => {
  const fig = typed(spatial2D(Text));
  return new fig(content).typed("text");
};
export const tex = (content: string) => label(content).format("latex");
export type TextNode = ReturnType<typeof label>;
