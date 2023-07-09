import {
  cos,
  interpolator,
  matrix,
  pi,
  sin,
  tan,
  v3,
  Vector,
} from "@weave/math";
import { CSSProperties } from "react";

class Space3D {
  w: number = 500;
  width(w: number) {
    this.w = w;
    return this;
  }
  h: number = 500;
  height(h: number) {
    this.h = h;
    return this;
  }
}

class Plane3D extends Space3D {
  points: (Vector[])[] = [];
  constructor() {
    super();
  }
  d() {
    return "";
  }
}

const plane3D = () => (
  new Plane3D()
);
const p = plane3D();

export const S3D1 = () => {
  const width = p.w;
  const height = p.h;
  const viewbox = `0 0 ${width} ${height}`;
  const paddingBottom = `${100 * (height / width)}%`;
  const boxcss: CSSProperties = {
    display: "inline-block",
    position: "relative",
    width: "100%",
    paddingBottom,
    overflow: "hidden",
    border: "solid thin lightgrey",
  };
  const svgcss: CSSProperties = {
    display: "inline-block",
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
  };
  const par = "xMidYMid meet";
  return (
    <div style={boxcss}>
      <svg
        viewBox={viewbox}
        preserveAspectRatio={par}
        style={svgcss}
      >
        <path d={p.d()} stroke={"black"} fill={"none"} />
      </svg>
    </div>
  );
};
