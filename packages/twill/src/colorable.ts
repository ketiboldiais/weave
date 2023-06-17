import { And, Axiom } from "./index.js";

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

export function colorable<NodeClass extends Axiom>(
  nodetype: NodeClass
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
      this.opacityValue = value;
      return this;
    }
    strokeColor?: string;
    stroke(color: string): this {
      this.strokeColor = color;
      return this;
    }
    fillColor?: string;
    /**
     * Sets the renderable node’s fill color.
     */
    fill(color: string): this {
      this.fillColor = color;
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
      this.strokeWidth = value;
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
      this.strokeDashArray = value;
      return this;
    }
  };
}
