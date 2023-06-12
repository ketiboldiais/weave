import { And, Axiom } from "./index.js";
import { safer } from "./aux.js";

export interface Colorable {
  /**
   * The renderable node’s stroke color.
   */
  strokeColor?: string;

  /**
   * Sets the renderable node’s stroke color.
   */
  stroke(color: string): this;

  /**
   * The renderable node’s fill color.
   */
  fillColor?: string;

  /**
   * Sets the renderable node’s fill color.
   */
  fill(color: string): this;

  /**
   * The renderable node’s stroke width
   * (how thick the node’s outline is).
   */
  strokeWidth?: number;

  /**
   * Sets the renderable node’s stroke width.
   */
  weight(value: number): this;

  /**
   * The renderable node’s dash property.
   * If 0, a solid line is shown.
   */
  strokeDashArray?: number;

  /**
   * Sets the renderable node’s dash property.
   */
  dash(value: number): this;

  /**
   * The renderable node’s opacity, a number
   * between 0 and 1. Values tending towards 0
   * appear more transparent, and values tending
   * towards 1 less transparent.
   */
  opacityValue?: number;
  opacity(value: number): this;
  copyColors(node: Colorable): this;
}


const clamp = (min:number,input:number,max:number) => (
  Math.min(Math.max(input,min),max)
)

const rgb = (r:number,g:number,b:number) => {
  const red = clamp(0,r,255);
  const green = clamp(0,g,255);
  const blue = clamp(0,b,255);
  return `rgb(${r},${g},${b})`;
}

export function colorable<NodeClass extends Axiom>(
  nodetype: NodeClass,
): And<NodeClass, Colorable> {
  return class extends nodetype {
    copyColors(node: Colorable) {
      this.strokeColor = node.strokeColor;
      this.fillColor = node.fillColor;
      this.strokeDashArray = node.strokeDashArray;
      this.opacityValue = node.opacityValue;
      return this;
    }
    opacityValue?: number;
    opacity(value: number) {
      this.opacityValue = safer(this.opacityValue, value);
      return this;
    }
    strokeColor?: string;
    stroke(color: string): this {
      this.strokeColor = safer(this.strokeColor, color);
      return this;
    }
    fillColor?: string;
    /**
     * Sets the renderable node’s fill color.
     */
    fill(color: string): this {
      this.fillColor = safer(this.fillColor, color);
      return this;
    }

    /**
     * The renderable node’s stroke width
     * (how thick the node’s outline is).
     */
    strokeWidth?: number;

    /**
     * Sets the renderable node’s stroke width.
     */
    weight(value: number): this {
      this.strokeWidth = safer(this.strokeWidth, value);
      return this;
    }

    /**
     * The renderable node’s dash property.
     * If 0, a solid line is shown.
     */
    strokeDashArray?: number;

    /**
     * Sets the renderable node’s dash property.
     */
    dash(value: number): this {
      this.strokeDashArray = safer(this.strokeDashArray, value);
      return this;
    }
  };
}
