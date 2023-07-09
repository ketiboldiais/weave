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
import { CSSProperties, useEffect, useRef } from "react";

// const CUBE_DISTANCE = 20;

class Space3D {
  w: number = 500;
  distance: number = 20;
  angleFOV: number = 20;
  width(w: number) {
    this.w = w;
    return this;
  }
  h: number = 500;
  height(h: number) {
    this.h = h;
    return this;
  }
  to3D(xy: number, z: number) {
    const angleRadians = (this.angleFOV / 180) * Math.PI;
    return xy / (z * Math.tan(angleRadians / 2));
  }
}

const cube = (C: number) => [
  // Bottom
  [
    v3(-C, C, -C),
    v3(C, C, -C),
    v3(C, C, C),
    v3(-C, C, C),
  ],
  // Top
  [
    v3(-C, -C, -C),
    v3(C, -C, -C),
    v3(C, -C, C),
    v3(-C, -C, C),
  ],
  // Front
  [
    v3(-C, -C, C),
    v3(C, -C, C),
    v3(C, C, C),
    v3(-C, C, C),
  ],
  // Back
  [
    v3(-C, -C, -C),
    v3(C, -C, -C),
    v3(C, C, -C),
    v3(-C, C, -C),
  ],
];

class Plane3D extends Space3D {
  points: (Vector[])[] = [];
  constructor() {
    super();
  }
  d() {
    const mx = (40 / this.w) * Math.PI;
    const my = (80 / this.h) * Math.PI;
    const faces2D = cube(0.15).map((points) =>
      points
        .map((p) => rotate3D(p, mx, my, 0))
        .map(({ x, y, z }) => ({ x: x, y: y, z: z + this.distance }))
        .map(({ x, y, z }) => ({
          x: this.to3D(x, z),
          y: this.to3D(y, z),
        }))
        .map(({ x, y }) => ({
          x: x * this.w + this.w / 2,
          y: y * this.h + this.h / 2,
        }))
    );
    const strs = [];
    for (const face of faces2D) {
      strs.push(`M${face[0].x},${face[0].y}`);
      for (const { x, y } of face.slice(1)) {
        strs.push(`L${x},${y}`);
      }
      strs.push("Z");
    }
    return strs.join("");
  }
}

const plane3D = () => (
  new Plane3D()
);
const p = plane3D();

export const S3D = () => {
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

function rotate3D(
  v:Vector,
  roll: number,
  pitch: number,
  yaw: number,
) {
  return v3(
    cos(yaw) * cos(pitch) * v.x +
      (cos(yaw) * sin(pitch) * sin(roll) -
          sin(yaw) * cos(roll)) *
        v.y +
      (cos(yaw) * sin(pitch) * cos(roll) +
          sin(yaw) * sin(roll)) *
        v.z,
    sin(yaw) * cos(pitch) * v.x +
      (sin(yaw) * sin(pitch) * sin(roll) +
          cos(yaw) * cos(roll)) *
        v.y +
      (sin(yaw) * sin(pitch) * cos(roll) -
          cos(yaw) * sin(roll)) *
        v.z,
    -sin(pitch) * v.x +
      cos(pitch) * sin(roll) * v.y +
      cos(pitch) * cos(roll) * v.z,
  );
}
