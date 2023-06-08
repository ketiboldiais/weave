import { colorable } from "./colorable";
import { typed } from "./typed.js";

class ArrowDefinition {
  constructor(
    public markerWidth: string | number = 6,
    public markerHeight: string | number = 6,
    public viewBox: string = `0 -5 10 10`,
    public path: string = `M0,-5L10,0L0,5Z`,
    public orient: string = "auto",
  ) {
  }
  /**
   * Sets the arrow head’s width and height.
   */
  sized(width: string | number, height: string | number = width) {
    this.markerWidth = width;
    this.markerHeight = height;
    return this;
  }

  set(
    prop: Exclude<
      keyof ArrowDefinition,
      "set" | "mark" | "markerWidth" | "markerHeight" | "sized"
    >,
    value: string,
  ) {
    this[prop] = value;
    return this;
  }
}

const ARROW_NODE = typed(colorable(ArrowDefinition));

export const arrowDef = (
  markerWidth: string | number = 6,
  markerHeight: string | number = 6,
  viewBox: string = `0 -5 10 10`,
  path: string = `M0,-5L10,0L0,5Z`,
  orient: string = "auto",
) => {
  return new ARROW_NODE(
    markerWidth,
    markerHeight,
    viewBox,
    path,
    orient,
  );
};
export type ArrowDefNode = ReturnType<typeof arrowDef>;
