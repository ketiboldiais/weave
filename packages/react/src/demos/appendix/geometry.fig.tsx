import { useEffect, useState } from "react";
import {
  aDiv,
  circle,
  cos,
  line,
  PI,
  plane,
  randFloat,
  randInt,
  range,
  sin,
  tex,
  text,
} from "../../loom";
import { Figure } from "../Screen";

const point = (x: number, y: number, r = 0.15) => (
  circle(r)
    .at(x, y)
    .fill("cyan")
    .stroke("none")
);

export const Point1 = () => {
  const R = range(0, 10, 0.03);
  const points = R.map((_) => point(randFloat(-5, 5), randFloat(-2, 2), 0.2));
  const d = plane([-5, 5], [-2, 2])
    .margins(10)
    .height(100)
    .xTickLength(0.05)
    .children(points).end();
  return <Figure of={d} />;
};

export const LineSegment1 = () => {
  const A = [-1, 0];
  const B = [1, 0];
  const d = plane([-5, 5], [-5, 5])
    .margins(0)
    .height(80)
    .and(
      line(A, B).stroke("tomato"),
      point(A[0], A[1], 1).fill("tomato"),
      point(B[0], B[1], 1).fill("tomato"),
      text("A").mode("LaTeX").at(A[0], A[1]).dx(-.4).fontColor("white"),
      text("B").mode("LaTeX").at(B[0], B[1]).dx(.1).fontColor("white"),
    ).end();
  return <Figure of={d} />;
};

export const Midpoint1 = () => {
  const A = [-1, 0];
  const B = [1, 0];
  const d = plane([-5, 5], [-5, 5])
    .margins(0)
    .height(80)
    .and(
      line(A, B).stroke("tomato"),
      point(0, 0, 1).fill("tomato"),
      point(A[0], A[1], 1).fill("tomato"),
      point(B[0], B[1], 1).fill("tomato"),
      text("A").mode("LaTeX").at(A[0], A[1]).dx(-.4).fontColor("white"),
      text("B").mode("LaTeX").at(B[0], B[1]).dx(.1).fontColor("white"),
      text("M").mode("LaTeX").at(0, 0).dx(-.2).dy(-.6).fontColor("white"),
    ).end();
  return <Figure of={d} />;
};

export const Ray1 = () => {
  const A = [-1, 0];
  const B = [1, 0];
  const d = plane([-5, 5], [-5, 5])
    .margins(0)
    .height(80)
    .and(
      line(A, B).stroke("tomato").arrowEnd(),
      point(A[0], A[1], 1).fill("tomato"),
      text("A").mode("LaTeX").at(A[0], A[1]).dx(-.4).dy(1).fontColor("white"),
    ).end();
  return <Figure of={d} />;
};

export const Line1 = () => {
  const A = [-3, 0];
  const B = [3, 0];
  const o = 1;
  const d = plane([-5, 5], [-5, 5])
    .margins(0)
    .height(80)
    .and(
      line(A, B).stroke("tomato").arrowEnd().arrowStart(),
      point(A[0] + o, A[1], 1).fill("tomato"),
      point(B[0] - o, B[1], 1).fill("tomato"),
      text("A").mode("LaTeX").at(A[0] + o, A[1]).dx(-.4).fontColor("white"),
      text("B").mode("LaTeX").at(B[0] - o, B[1]).dx(.1).fontColor("white"),
    ).end();
  return <Figure of={d} />;
};

export const Concurrent1 = () => {
  const A = [-3, 0];
  const B = [3, 0];
  const r = .7;
  const color = 'tomato';
  const lines = range(-2, 2, .15).map(
    (n) =>
      line(A, B)
        .stroke(color)
        .opacity(0.3)
        .arrowEnd()
        .arrowStart()
        .rotateZ(n * randFloat(0.1, 2 * PI)),
  );
  const d = plane([-5, 5], [-5, 5])
    .margins(10)
    .height(150)
    .children([lines])
    .and(point(0, 0, r).fill(color))
    .end();
  return <Figure of={d} />;
};

export const Circle1 = () => {
  const d = plane([-5,5], [-5,5])
    .margins(10)
    .height(200)
    .width(600)
    .and(
      circle(10).at(0,0).stroke('cyan'),
      circle(.5).at(0,0).stroke('none').fill('cyan'),
      tex('C').at(0,1.5).fontColor('white')
    ).end();
  return <Figure of={d} />;
};

export const CircleNoHit = () => {
  const d = plane([-5,5], [-5,5])
    .margins(10)
    .height(200)
    .width(600)
    .and(
      circle(8).at(0,0).stroke('cyan'),
      circle(.5).at(0,0).stroke('none').fill('cyan'),
      line([-3,-1],[-1,5]).stroke('white').arrowed(),
      tex('C').at(0,1.5).fontColor('white')
    ).end();
  return <Figure of={d} />;
};

export const CircleTangent = () => {
  const d = plane([-5,5], [-5,5])
    .margins(10)
    .height(200)
    .width(600)
    .and(
      circle(8).at(0,0).stroke('cyan'),
      circle(.5).at(0,0).stroke('none').fill('cyan'),
      line([-3,-1],[.14,5]).stroke('tomato').arrowed(),
      circle(.5).at(-.6,3.5).stroke('none').fill('tomato'),
      tex('C').at(0,1.5).fontColor('white')
    ).end();
  return <Figure of={d} />;
};

export const CircleSecant = () => {
  const d = plane([-5,5], [-5,5])
    .margins(10)
    .height(200)
    .width(600)
    .and(
      circle(8).at(0,0).stroke('cyan'),
      line([-3,0],[3,0]).stroke('tomato').arrowed(),
      line([-1,5],[2,0.5]).stroke('tomato').arrowed(),
      tex('C').at(0,1.5).fontColor('white'),
      circle(.5).at(0,0).stroke('none').fill('cyan'),
    ).end();
  return <Figure of={d} />;
};
