import {
  ScaleLinear,
  scaleLinear,
  scaleLog,
  ScaleLogarithmic,
  scalePow,
  ScalePower,
  ScaleRadial,
  scaleRadial,
} from "d3";
import { shift } from "./index.js";

export type ScaleName = "linear" | "power" | "radial" | "log";
export type LinearScale = ScaleLinear<number, number, never>;
export type PowerScale = ScalePower<number, number, never>;
export type RadialScale = ScaleRadial<number, number, never>;
export type LogScale = ScaleLogarithmic<number, number, never>;
export type Scaler = LinearScale | PowerScale | RadialScale | LogScale;

export class Space {
  scaletype: ScaleName = "linear";
  xmin() {
    return this.dom[0];
  }
  xmax() {
    return this.dom[1];
  }
  ymin() {
    return this.ran[0];
  }
  ymax() {
    return this.ran[1];
  }
  scale() {
    const type = this.scaletype;
    switch (type) {
      case "linear":
        return scaleLinear;
      case "log":
        return scaleLog;
      case "power":
        return scalePow;
      case "radial":
        return scaleRadial;
      default:
        return scaleLinear;
    }
  }
  scaled(type: ScaleName) {
    this.scaletype = type;
    return this;
  }
  width: number = 500;
  height: number = 500;
  size(width: number, height: number) {
    this.width = width;
    this.height = height;
    return this;
  }
  margins: [number, number, number, number] = [50, 50, 50, 50];
  margin(
    top: number,
    right: number,
    bottom: number = top,
    left: number = right,
  ) {
    this.margins[0] = top;
    this.margins[1] = right;
    this.margins[2] = bottom;
    this.margins[3] = left;
    return this;
  }
  marginOf(order: "top" | "right" | "bottom" | "left") {
    switch (order) {
      case "top":
        return this.margins[0];
      case "right":
        return this.margins[1];
      case "bottom":
        return this.margins[2];
      case "left":
        return this.margins[3];
      default:
        return 50;
    }
  }
  boxed(dimension: "height" | "width") {
    if (dimension === "height") {
      const height = this.height;
      const top = this.marginOf("top");
      const bottom = this.marginOf("bottom");
      return height - top - bottom;
    } else {
      const width = this.width;
      const left = this.marginOf("left");
      const right = this.marginOf("right");
      return width - left - right;
    }
  }

  dom: [number, number] = [-10, 10];
  domain(value: [number, number]) {
    this.dom = value;
    return this;
  }
  ran: [number, number] = [-10, 10];
  range(value: [number, number]) {
    this.ran = value;
    return this;
  }
  center() {
    const mx = this.marginOf("left") + this.marginOf("right");
    const my = this.marginOf("top") + this.marginOf("bottom");
    return shift(mx / 2, my / 2);
  }
}
