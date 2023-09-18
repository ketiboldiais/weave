import {
  circle,
  line,
  mapping,
  PI,
  plane,
  quad,
  sqrt,
  tex,
  text,
  TWO_PI,
} from "../../loom";
import { Figure } from "../Screen";

export const RealLine = () => {
  const third = 1 / 3;
  const sevenTwo = -7 / 2;
  const lineColor = "lime";
  const lines = [
    line([-10, 0], [10, 0]).stroke(lineColor).arrowed(),
    line([0, -1], [0, 1]),
    line([2, -1], [2, 1]),
    line([-7, -1], [-7, 1]),
    line([8.4, -1], [8.4, 1]),
    line([-sqrt(2), 0], [-sqrt(2), -3]),
    line([third, 0], [third, -3]),
    line([sevenTwo, 0], [sevenTwo, -3]),
    line([PI, 0], [PI, -4]),
    line([TWO_PI, 0], [TWO_PI, -4]),
  ].map((l) => l.stroke(lineColor));
  const d = plane([-10, 10])
    .marginTop(60)
    .height(70)
    .width(600)
    .children([
      lines,
      [
        text(0).at(0, 6),
        text(2).at(2, 6),
        text(-7).at(-7, 6),
        text(8.4).at(8.4, 6),
      ].map((t) => t.dy(3).fontColor("white")),
      tex("-\\infty").at(-10.5, 0),
      tex("+\\infty").at(9.5, 0),
      tex("\\frac{1}{3}").at(-third + .5, -17).fontSize(18),
      tex("-\\frac{7}{2}").at(sevenTwo - .8, -17).fontSize(18),
      tex("\\pi").at(PI - .15, -15).anchor("middle").fontSize(15),
      tex("2\\pi").at(TWO_PI - .2, -15).anchor("middle").fontSize(14),
      tex("-\\sqrt{2}").at((-sqrt(2)) - 1, -10).anchor("middle"),
    ])
    .end();
  return <Figure of={d} />;
};

export const Subset1 = () => {
  const circles = [
    circle(2).at(-.7, 0).fill("gold"),
    circle(4).at(0, 0).fill("cyan"),
  ].map((c) => c.stroke("none").opacity(.5));
  const labels = [
    tex("B").at(-1, 1),
    tex("A").at(1, 1.5),
  ];
  const d = plane([-5, 5], [-5, 5])
    .bordered("white")
    .margins(0, 100, 10, 100)
    .height(130)
    .width(400)
    .children([circles, labels])
    .end();
  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <Figure of={d} />
    </div>
  );
};

export const Union1 = () => {
  const circles = [
    circle(3).at(-1, 0).fill("violet"),
    circle(3).at(1, 0).fill("violet"),
  ].map((c) => c.stroke("none").opacity(.5));
  const labels = [
    tex("A").at(-3.5, 2),
    tex("B").at(2.9, 1.5),
    tex("A \\cup B").at(-.9, 4.7),
  ];
  const d = plane([-5, 5], [-5, 5])
    .bordered("white")
    .margins(0, 100, 10, 100)
    .height(130)
    .width(400)
    .children([circles, labels])
    .end();
  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <Figure of={d} />
    </div>
  );
};

export const Complement1 = () => {
  const circles = [
    circle(3).at(0, 0).fill("tomato").opacity(.8),
  ].map((c) => c.stroke("none"));
  const labels = [
    tex("S").at(-.3, 1),
    tex("S'").at(3, 4),
    tex("U").at(-4.7, 4.5),
  ];
  const d = plane([-5, 5], [-5, 5])
    .bordered("white")
    .margins(0, 100, 10, 100)
    .height(130)
    .width(400)
    .children([
      quad(10, 10).at(-5, 5).fill("white").opacity(.1),
      circles,
      labels,
    ])
    .end();
  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <Figure of={d} />
    </div>
  );
};

export const Intersection1 = () => {
  const circles = [
    circle(3).at(-1, 0).fill("tomato").opacity(.8),
    circle(3).at(1, 0).fill("gold").opacity(.5),
  ].map((c) => c.stroke("none"));
  const labels = [
    tex("A").at(-3.5, 2),
    tex("B").at(2.9, 1.5),
    tex("A \\cap B").at(-.9, 4.7),
  ];
  const d = plane([-5, 5], [-5, 5])
    .bordered("white")
    .margins(0, 100, 10, 100)
    .height(130)
    .width(400)
    .children([
      circles,
      labels,
      line([0, 3.2], [0, 2]).stroke("white").arrowEnd(),
    ])
    .end();
  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <Figure of={d} />
    </div>
  );
};

export const Reflexive1 = () => {
  const d = mapping({
    a: ["a"],
    b: ["b"],
    c: ["c"],
  }).margins(0).width(300).height(100).range(-3, 3).stroke("tomato").fill(
    "white",
  ).end();
  return (
    <div style={{ width: "70%", margin: "0 auto" }}>
      <Figure of={d} />
    </div>
  );
};
