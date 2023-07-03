import { unsafe } from "./aux.js";
import { colorable } from "./colorable.js";
import { FigNode } from "./index.js";
import { tagged, typed } from "./typed.js";

class ArrowDefinition {
  refX: number | string = 8;
  refY: number | string = 0;
  ref(of:'x'|'y', value:number|string) {
    if (of==='x') {
      this.refX = value;
    } else if (of === 'y') {
      this.refY = value;
    }
    return this;
  }
  rotation(value:string|number) {
    this.orient = value;
    return this;
  }
  viewbox(value: string) {
    this.viewBox = value;
    return this;
  }
  path(value:string) {
    this.d = value;
    return this;
  }
  constructor(
    public markerWidth: string | number = 6,
    public markerHeight: string | number = 6,
    public viewBox: string = `0 -5 10 10`,
    public d: string = `M0,-5L10,0L0,5Z`,
    public orient: string|number = "auto",
  ) {}
  /**
   * Sets the arrow head’s width and height.
   */
  sized(
    width: string | number,
    height: string | number = width,
  ) {
    this.markerWidth = width;
    this.markerHeight = height;
    return this;
  }
}

const ARROW_NODE = typed(colorable(tagged(ArrowDefinition)));

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
  ).typed("arrow");
};
export type ArrowDefNode = ReturnType<typeof arrowDef>;
export const isArrow = (
  node: FigNode,
): node is ArrowDefNode => !unsafe(node) && node.isType("arrow");
