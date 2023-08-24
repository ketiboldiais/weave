import { useState } from "react";
import { IDE } from "./ScreenAUX.js";
import {
  Axis,
  axis,
  Circle,
  circle,
  engine,
  Fig,
  fig,
  Group,
  group,
  Line,
  line,
  Path,
  Plot2D,
  plot2D,
  Shape,
} from "./io.js";

export const F1 = () => {
  const data = fig([
    group([
      axis("x").opacity(0.4),
      axis("y").opacity(0.4),
      plot2D("f(x) = e^-x").stroke("red").domain(-10, 10).range(-10, 10),
      plot2D("f(x) = ln(x)").stroke("blue").domain(-10, 10).range(-10, 10),
    ]).interpolate([-10, 10], [-10, 10], [500, 500]),
  ]);
  return <Figure of={data} />;
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
  const AXIS = ({ of }: { of: Axis }) => {
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
  const PATH = ({ of }: { of: Path }) => {
    return (
      <path
        d={of.toString()}
        fill={of._fill}
        stroke={of._stroke}
        strokeWidth={of._strokeWidth}
        strokeDasharray={of._dash}
        opacity={of._opacity}
        shapeRendering={'geometricPrecision'}
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
        <SHAPES of={of.children} />
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
  const [result, setResult] = useState("");
  const [code, setCode] = useState(source.trimStart().trimEnd());
  const click = () => {
    const logs = engine(code).log().join("\n");
    setResult(logs);
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
        {/* <textarea style={{ height }} value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} /> */}
      </div>
      {result && <pre className={"terminal"}>{result}</pre>}
      <div>
        <button className={"run-button"} onClick={click}>Run</button>
      </div>
    </div>
  );
};
