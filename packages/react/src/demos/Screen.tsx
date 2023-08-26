import { CSSProperties, useEffect, useState } from "react";
import { IDE } from "./ScreenAUX.js";
import {
  Axis,
  axis,
  Circle,
  circle,
  engine,
  Fig,
  fig,
  forceGraph,
  graph,
  Group,
  group,
  histogram,
  interpolator,
  Line,
  line,
  Path,
  Plot2D,
  plot2D,
  Quad,
  quad,
  scatterPlot,
  Shape,
  Text,
} from "./io.js";
import katex from "katex";
type Html = { __html: string };
const html = (__html: string): Html => ({ __html });
type TexProps = {
  d: string;
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

export const F1 = () => {
  const data = fig([
    group([
      axis("x"),
      axis("y"),
      plot2D("f(x) = tan(x)").stroke("tomato"),
    ]).end(),
  ]).domain(-10, 10).range(-10, 10).end();
  const d = forceGraph(graph({
    a: ["b", "x", "n"],
    b: ["c", "d", "g", "n"],
    c: ["e", "g"],
    d: ["j", "k", "e"],
    e: ["k"],
    j: ["x", "s", "a"],
    k: ["j", "s"],
    n: ["g"],
    s: ["x"],
  })).nodeColor("tomato").end();
  const s = scatterPlot(
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
  ]).pointStroke("crimson").fill("tomato").stroke("white").end();
  const h = histogram([1, 1, 3, 1, 1, 2, 2, 3, 2, 1, 4, 4, 2])
    .margins(100,100)
    .stroke('white')
    .barColor('white')
    .end();
  return <Figure of={h} />;
};

export const Figure = ({ of }: { of: Fig }) => {
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

  const GROUP = ({ of }: { of: Group }) => {
    return (
      <g
        fill={of._fill}
        stroke={of._stroke}
        strokeWidth={of._strokeWidth}
        strokeDasharray={of._dash}
        opacity={of._opacity}
      >
        <SHAPES of={of.children} />
      </g>
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
        />
        {of._label && <TEXT of={of._label} />}
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

  const AXIS = ({ of }: { of: Axis }) => {
    return (
      <g id={of._type}>
        <path
          d={of.toString()}
          fill={of._fill}
          stroke={of._stroke}
          strokeWidth={of._strokeWidth}
          strokeDasharray={of._dash}
          opacity={of._opacity}
        />
        {of._ticks.map((l, i) => <LINE key={`tick-${i}`} of={l} />)}
      </g>
    );
  };

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

  const PLOT2D = ({ of }: { of: Plot2D }) => {
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
    return (
      <text
        dx={of.commands[0].end.x}
        dy={of.commands[0].end.y}
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
      } else if (d instanceof Plot2D) {
        return <PLOT2D of={d} />;
      } else if (d instanceof Group) {
        return <GROUP of={d} />;
      } else if (d instanceof Axis) {
        return <AXIS of={d} />;
      } else if (d instanceof Text) {
        return <TEXT of={d} />;
      } else if (d instanceof Quad) {
        return <QUAD of={d} />;
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

  return (
    <div style={boxcss}>
      <svg viewBox={viewbox} preserveAspectRatio={par} style={svgcss}>
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
      {result && <Output />}
      <div>
        <button className={"run-button"} onClick={click}>Run</button>
      </div>
    </div>
  );
};
