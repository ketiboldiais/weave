const { cos, sin, PI } = Math;

const brown = "#7D7463";

import { CSSProperties, ReactNode, useEffect, useState } from "react";

import { IDE } from "./ScreenAUX.js";

import { heights } from "./data.heights.js";

import {
  Area2D,
  barPlot,
  Circle,
  circle,
  dotPlot,
  engine,
  forceGraph,
  graph,
  histogram,
  interpolator,
  leaf,
  Line,
  line,
  linePlot,
  Markers,
  Parent,
  Path,
  plane,
  plot2D,
  polar2D,
  Quad,
  randInt,
  range,
  scatterPlot,
  Shape,
  space3D,
  subtree,
  Text,
  text,
  tree,
} from "../loom/index.js";

import katex from "katex";

const P = (x: number) => x.toPrecision(2);

type Html = { __html: string };

const html = (__html: string): Html => ({ __html });

type TexProps = {
  d: string | number;
  block?: boolean;
  style?: CSSProperties;
};

export const Tex = ({ d, style, block }: TexProps) => {
  const content = d;
  const mode = block;
  const Component = block ? "div" : "span";
  const displayMode = mode !== undefined;
  const [state, enstate] = useState(html(""));
  useEffect(() => {
    try {
      const data = katex.renderToString(`${content}`, {
        displayMode,
        throwOnError: false,
        output: "html",
        errorColor: "tomato",
      });
      enstate(html(data));
    } catch (error) {
      if (error instanceof Error) {
        enstate(html(error.message));
      } else {
        enstate(html(""));
      }
    }
  }, [mode, content]);
  return (
    <Component
      style={style}
      dangerouslySetInnerHTML={state}
    />
  );
};

export const ForceGraph1 = () => {
  const d = forceGraph(graph({
    a: ["b", "x", "n"],
    b: ["c", "d", "g", "n"],
    c: ["e", "g"],
    d: ["j", "k", "e"],
    e: ["k"],
    j: ["x", "s", "a"],
    k: ["j", "s"],
    n: ["g", "x"],
    x: ["s"],
  })).nodeFontColor("white")
    .nodeColor("aqua")
    .nodeRadius(5)
    .nodeFontFamily("KaTeX_Math")
    .nodeFontSize(28)
    .edgeColor("lightblue")
    .iterations(100)
    .repulsion(20)
    .end();
  return <Figure of={d} />;
};

export const FG2 = () => {
  const d = forceGraph(graph({
    a: ["b", "c", "d"],
    b: ["e", "f"],
  }))
    .height(300)
    .width(400)
    .nodeFontColor("white")
    .nodeColor("violet")
    .nodeRadius(8)
    .nodeFontFamily("KaTeX_Math")
    .nodeFontSize(28)
    .edgeColor("violet")
    .iterations(200)
    .repulsion(50)
    .end();
  console.log(d);
  return <Figure of={d} />;
};

export const Polar1 = () => {
  const data = polar2D("f(x) = e^(sin(x)) - 2cos(4x) + (sin((2x - pi)/24))^5")
    .cycles(12 * Math.PI)
    .radius(5)
    .stroke("#D67BFF")
    .strokeWidth(2)
    .axisColor("lightgrey")
    .end();
  return <Figure of={data} />;
};

export const Plot1 = () => {
  const data = plot2D(`f(x) = tan(x)`)
    .samples(500)
    .strokeWidth(2)
    .axisColor("white")
    .stroke("hotpink")
    .end();
  return <Figure of={data} />;
};

export const Plot2 = () => {
  const data = plot2D("f(x) = -x^5 + 4x^3")
    .samples(300)
    .integrate({
      bounds: [-2, 2],
      fill: "gold",
      opacity: 0.2,
    })
    .domain(-4, 4)
    .range(-20, 20)
    .xTickLength(0.5)
    .yTickLength(0.1)
    .strokeWidth(2)
    .yTickSep(5)
    .axisColor("white")
    .stroke("sandybrown")
    .strokeWidth(3)
    .end();
  return <Figure of={data} />;
};

export const Knuth1 = () => {
  const data = tree(
    subtree("a").nodes([
      subtree("b").nodes([
        leaf("c"),
        leaf("d"),
      ]),
      subtree("e").nodes([
        leaf("f"),
        leaf("g"),
      ]),
    ]),
  ).layout("knuth")
    .textMap((t) => t.fontColor("white").fontFamily("KaTeX_Math"))
    .edgeStroke("white")
    .nodeFill("lavender").end();
  return <Figure of={data} />;
};

export const DotPlot1 = () => {
  // deno-fmt-ignore
  const data = dotPlot([
    5, 6, 6, 7, 7, 7, 7, 7, 8, 8, 8, 9, 9, 10,
  ]).margins(0,10,40,10)
    .height(300)
    .width(300)
    .dotStroke('white')
    .dotFill('none')
    .stroke('white')
    .end();
  return <Figure of={data} />;
};

export const HV1 = () => {
  const data = tree(
    subtree("a").nodes([
      subtree("b").nodes([
        subtree("e").nodes([
          leaf("f"),
          leaf("g"),
        ]),
        leaf("q"),
      ]),
      subtree("w").nodes([
        leaf("l"),
        subtree("x").nodes([
          leaf("y"),
          leaf("z"),
        ]),
      ]),
    ]),
  ).layout("hv")
    .textMap((t) => t.fontColor("white").dx(-0.5).fontFamily("KaTeX_Math"))
    .edgeStroke("tomato")
    .nodeRadius(0.3)
    .nodeFill("white")
    .end();
  return <Figure of={data} />;
};

export const ReingoldTilford1 = () => {
  const data = tree(
    subtree("a").nodes([
      subtree("b").nodes([
        subtree("d").nodes([
          leaf("e"),
          leaf("f"),
        ]),
        leaf("m"),
      ]),
      subtree("h").nodes([
        leaf("i"),
        leaf("j"),
      ]),
    ]),
  ).layout("reingold-tilford")
    .textMap((t) => t.fontColor("white").fontFamily("KaTeX_Math"))
    .nodeRadius(0.3)
    .edgeStroke("goldenrod")
    .nodeFill("wheat")
    .end();
  return <Figure of={data} />;
};

export const BarPlot1 = () => {
  const data = barPlot({
    apple: 12.2,
    banana: 14.5,
    melon: 9.8,
    kiwi: 16.2,
    durian: 4.8,
  }).barColor("deepskyblue")
    .barStroke("none")
    .stroke("white")
    .end();
  return <Figure of={data} />;
};

export const Buccheim1 = () => {
  const data = tree(
    subtree("a").nodes([
      subtree("b").nodes([
        subtree("d").nodes([
          leaf("e"),
          leaf("u"),
          leaf("f"),
        ]),
        leaf("m"),
      ]),
      leaf("x"),
      subtree("h").nodes([
        leaf("i"),
        leaf("k"),
        leaf("j"),
      ]),
    ]),
  )
    .margins(10, 60)
    .height(300)
    .width(300)
    .layout("buccheim-unger-leipert")
    .textMap((t) => t.fontColor("white").fontFamily("KaTeX_Math"))
    .nodeRadius(0.3)
    .edgeStroke("orangered")
    .nodeFill("salmon")
    .end();
  return <Figure of={data} />;
};

export const WetherellShannon1 = () => {
  const data = tree(
    subtree("a").nodes([
      subtree("b").nodes([
        subtree("d").nodes([
          leaf("e"),
          leaf("f"),
        ]),
        leaf("m"),
      ]),
      subtree("h").nodes([
        leaf("i"),
        leaf("j"),
      ]),
    ]),
  ).layout("wetherell-shannon")
    .textMap((t) => t.fontColor("white").fontFamily("KaTeX_Math"))
    .nodeRadius(0.3)
    .edgeStroke("goldenrod")
    .nodeFill("wheat")
    .end();
  return <Figure of={data} />;
};

export const Histogram1 = () => {
  const h = histogram(heights)
    .yTickLength(0.6)
    .xTickSep(8)
    .barColor("salmon")
    .stroke("white").end();
  return <Figure of={h} />;
};

export const ArrowLeft1 = () => {
  const rays = range(0, 1, 0.02).map((n) => {
    const l = line([0, 0], [randInt(-5, 5) * n, randInt(-5, 5)]).stroke(
      "#16FF00",
    )
      .arrowEnd();
    return l;
  });
  const d = plane()
    .width(400).height(400).margins(10, 10)
    .domain(-5, 5)
    .range(-5, 5)
    .axisColor("white").axis("x").axis("y").and(
      ...rays,
    ).end();
  return <Figure of={d} />;
};

export const Scatter1 = () => {
  const data = scatterPlot(
    (d: [number, number]) => d[0],
    (d: [number, number]) => d[1],
  ).data([
    [0.1, 0.2],
    [0.7, 0.45],
    [1, 1],
    [1.4, 2],
    [1.6, 2.3],
    [1.8, 2.25],
    [1.9, 3.2],
    [2.4, 3.5],
    [3.1, 3.82],
  ]).pointStroke("green").fill("springgreen").stroke("white").end();
  return <Figure of={data} />;
};

export const LinePlot1 = () => {
  const d = linePlot({
    2001: 1_123,
    2002: 1_268,
    2003: 1_407,
    2004: 1_819,
    2005: 2_014,
    2006: 2_102,
    2007: 2_372,
    2008: 2_522,
    2009: 2_683,
    2010: 2_717,
    2011: 2_901,
    2012: 3_001,
    2013: 3_211,
  }).margins(40).width(400).height(400).stroke("white").lineColor("cyan").end();
  return <Figure of={d} />;
};

export const Figure = ({ of }: { of: Parent }) => {
  const width = of._width;
  const height = of._height;
  const viewbox = `0 0 ${width} ${height}`;
  const paddingBottom = `${100 * (height / width)}%`;
  const boxcss = {
    display: "inline-block",
    position: "relative",
    width: "100%",
    paddingBottom,
    overflow: "hidden",
  } as const;
  const svgcss = {
    display: "inline-block",
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
  } as const;

  const par = "xMidYMid meet";

  const AREA = ({ of }: { of: Area2D }) => {
    return (
      <path
        d={of.toString()}
        fill={of._fill}
        stroke={of._stroke}
        strokeWidth={of._strokeWidth}
        strokeDasharray={of._dash}
        opacity={of._opacity}
        shapeRendering={"geometricPrecision"}
      />
    );
  };

  const LINE = ({ of }: { of: Line }) => {
    return (
      <>
        <path
          d={of.toString()}
          fill={of._fill}
          stroke={of._stroke}
          strokeWidth={of._strokeWidth}
          strokeDasharray={of._dash}
          opacity={of._opacity}
          markerEnd={of._arrowEnd ? `url(#${of._id}-end)` : ""}
          markerStart={of._arrowEnd ? `url(#${of._id}-start)` : ""}
        />
      </>
    );
  };

  const CIRCLE = ({ of }: { of: Circle }) => {
    return (
      <path
        d={of.toString()}
        fill={of._fill}
        stroke={of._stroke}
        strokeWidth={of._strokeWidth}
        strokeDasharray={of._dash}
        opacity={of._opacity}
      />
    );
  };

  const shift = (x: number, y: number) => `translate(${x},${y})`;

  const PATH = ({ of }: { of: Path }) => {
    return (
      <path
        d={of.toString()}
        fill={of._fill}
        stroke={of._stroke}
        strokeWidth={of._strokeWidth}
        strokeDasharray={of._dash}
        opacity={of._opacity}
        shapeRendering={"geometricPrecision"}
      />
    );
  };

  const QUAD = ({ of }: { of: Quad }) => {
    return (
      <path
        d={of.toString()}
        fill={of._fill}
        stroke={of._stroke}
        strokeWidth={of._strokeWidth}
        strokeDasharray={of._dash}
        opacity={of._opacity}
      />
    );
  };

  const TEXT = ({ of }: { of: Text }) => {
    const x = of._x;
    const y = of._y;
    if (of._mode === "LaTeX") {
      return (
        <foreignObject x={x} y={y} width={"100%"} height={"100%"}>
          <Tex d={of._text} />
        </foreignObject>
      );
    }
    return (
      <text
        dx={x}
        dy={y}
        textAnchor={of._textAnchor}
        fill={of._fontColor}
        fontFamily={of._fontFamily}
        fontSize={of._fontSize}
        style={{
          fontWeight: 100,
        }}
      >
        {of._text}
      </text>
    );
  };

  const SHAPES = ({ of }: { of: Shape[] }) => {
    const F = ({ d }: { d: Shape }) => {
      if (d instanceof Line) {
        return <LINE of={d} />;
      } else if (d instanceof Circle) {
        return <CIRCLE of={d} />;
      } else if (d instanceof Path) {
        return <PATH of={d} />;
      } else if (d instanceof Text) {
        return <TEXT of={d} />;
      } else if (d instanceof Quad) {
        return <QUAD of={d} />;
      } else if (d instanceof Area2D) {
        return <AREA of={d} />;
      } else {
        return null;
      }
    };

    return (
      <>
        {of.map((d, i) => <F key={i + "shape"} d={d} />)}
      </>
    );
  };

  const DEFS = ({ of }: { of: Markers[] }) => {
    return (
      <defs>
        {of.map((x, i) => (
          <marker
            key={`${x._id}-${x._type}-${i}`}
            id={`${x._id}-${x._type}`}
            markerWidth={x._markerWidth}
            markerHeight={x._markerHeight}
            refX={x._refX}
            refY={x._refY}
            orient={x._orient}
            markerUnits={"strokeWidth"}
            viewBox={"0 -5 10 10"}
          >
            <path
              d={x._d}
              fill={x._fill}
              stroke={x._stroke}
            />
          </marker>
        ))}
      </defs>
    );
  };

  return (
    <div style={boxcss}>
      <svg viewBox={viewbox} preserveAspectRatio={par} style={svgcss}>
        <DEFS of={of._markers} />
        <g transform={shift(of._mx / 2, of._my / 2)}>
          <SHAPES of={of._children} />
        </g>
      </svg>
    </div>
  );
};

export const Terminal = (
  { source, height = "fit-content" }: {
    source: string;
    height: string | number;
  },
) => {
  const [result, setResult] = useState<string[]>([]);
  const [mode, setMode] = useState<"ok" | "error">("ok");
  const [code, setCode] = useState(source.trimStart().trimEnd());
  const click = () => {
    const logs = engine(code).log("latex");
    if (logs.error) {
      setMode("error");
      setResult([logs.error]);
    } else {
      setResult(logs.result);
    }
  };
  const Output = () => {
    if (mode === "error") {
      return <pre className={"terminal"}>{result.join('')}</pre>;
    } else {
      return (
        <div className={"latex-screen"}>
          {result.map((s, i) => <Tex key={"code" + i} d={s} block />)}
        </div>
      );
    }
  };
  return (
    <div>
      <div>
        <IDE
          init={code}
          tabSize={2}
          onTextChange={(e) => setCode(e)}
          height={height}
        />
      </div>
      {result.length !== 0 && <Output />}
      <div>
        <button className={"run-button"} onClick={click}>Run</button>
      </div>
    </div>
  );
};

export const M1 = () => {
  const f = interpolator([0, 100], [-10, 10]);
  const rf = interpolator([-10, 10], [0, 100]);
  const [x, setX] = useState(rf(-5));
  const [y, setY] = useState(rf(7));
  const data = plane([-10, 10], [-10, 10])
    .axisColor(brown)
    .axis("x")
    .axis("y")
    .and(
      line([f(x), -10], [f(x), 10])
        .stroke("lightgrey")
        .dash(6),
      line([-10, f(y)], [10, f(y)])
        .stroke("lightgrey")
        .dash(6),
      circle(0.5)
        .fill("tomato")
        .stroke("white")
        .at(f(x), f(y)),
      text(`(${f(x).toPrecision(2)}, ${f(y).toPrecision(2)})`).at(f(x), f(y))
        .fontSize(12)
        .anchor("middle")
        .fontColor("white")
        .dy(1),
    ).end();
  return (
    <>
      <section className={"hstack"}>
        <label>
          <Tex d={"x"} />
        </label>
        <input
          value={x}
          type={"range"}
          onChange={(e) => setX(e.target.valueAsNumber)}
        />
      </section>
      <section className={"hstack"}>
        <label>
          <Tex d={"y"} />
        </label>
        <input
          value={y}
          type={"range"}
          onChange={(e) => setY(e.target.valueAsNumber)}
        />
      </section>
      <Figure of={data} />
    </>
  );
};

export const Line1 = () => {
  const f = interpolator([0, 100], [-5, 5]);
  const g = interpolator([-5, 5], [0, 100]);

  const [x1, setX1] = useState(-3);
  const [y1, setY1] = useState(-5);

  const [x2, setX2] = useState(3);
  const [y2, setY2] = useState(5);

  const d = plane([-5, 5], [-5, 5])
    .axisColor(brown)
    .axis("x")
    .axis("y")
    .and(
      line([x1, y1], [x2, y2]).stroke("tomato"),
      text(`(${P(x1)}, ${P(y1)})`)
        .at(x1, y1)
        .fontColor("white")
        .fontSize(10)
        .dx(x1 - (x1 / 1.05))
        .dy(y1 - (y1 / 1.05)),
      text(`(${P(x2)}, ${P(y2)})`)
        .at(x2, y2)
        .fontColor("white")
        .fontSize(10)
        .dx(x2 - (x2 / 1.03))
        .dy(y2 - (y2 / 1.01)),
    )
    .end();
  return (
    <div>
      <RangeInput t={<Tex d={"x_1"} />} val={g(x1)} f={(x) => setX1(f(x))} />
      <RangeInput t={<Tex d={"y_1"} />} val={g(y1)} f={(x) => setY1(f(x))} />
      <RangeInput t={<Tex d={"x_2"} />} val={g(x2)} f={(x) => setX2(f(x))} />
      <RangeInput t={<Tex d={"y_2"} />} val={g(y2)} f={(x) => setY2(f(x))} />
      <Figure of={d} />
    </div>
  );
};

export const Circle1 = () => {
  const f = interpolator([0, 100], [0, 20]);
  const a = interpolator([0, 100], [0, 2 * PI]);
  const R = (x: number) => f(x) / 2;
  const rf = interpolator([0, 2.5], [0, 100]);
  const [r, setR] = useState(rf(3) / 2);
  const [theta, setTheta] = useState(r);
  const updateRadius = (x: number) => {
    setR(x);
    setTheta(x);
  };
  const data = plane([-10, 10], [-10, 10])
    .axisColor(brown)
    .axis("x")
    .axis("y")
    .and(
      line([0, 0], [0, R(r)]).stroke("tomato").rotateZ(a(theta)),
      text(`𝑟 = ${R(r).toPrecision(3)}`)
        .at(0, R(r))
        .rotateZ(PI / 4)
        .fontColor("tomato")
        .fontSize(15)
        .dy(0.5),
      circle(f(r))
        .stroke("white")
        .fill("none")
        .at(0, 0),
      line([R(r) * sin(a(theta)), R(r) * cos(a(theta))], [
        0,
        R(r) * cos(a(theta)),
      ]).stroke("lightgrey").dash(3).opacity(0.8),
      line([R(r) * sin(a(theta)), 0], [
        R(r) * sin(a(theta)),
        R(r) * cos(a(theta)),
      ])
        .stroke("lightgrey").dash(3).opacity(0.8),
      circle(0.4)
        .stroke("white")
        .fill("tomato")
        .at(0, R(r))
        .rotateZ(a(theta)),
    ).end();
  return (
    <>
      <section className={"hstack"}>
        <label>
          <Tex d={"r"} />
        </label>
        <input
          value={r}
          type={"range"}
          onChange={(e) => updateRadius(e.target.valueAsNumber)}
        />
      </section>
      <Figure of={data} />
    </>
  );
};

type RangeInputProps = {
  t: ReactNode;
  val: number;
  f: (x: number) => void;
};

const RangeInput = ({ t, val, f }: RangeInputProps) => {
  return (
    <section className={"hstack"}>
      <label>{t}</label>
      <input
        value={val}
        type={"range"}
        onChange={(e) => f(e.target.valueAsNumber)}
      />
    </section>
  );
};

export const Space3D_Demo1 = () => {
  const d = space3D()
    .width(500)
    .margins(0)
    .domain(-10, 10)
    .range(-10, 50)
    .end();
  return <Figure of={d} />;
};
