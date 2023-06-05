import {
  AxisNode,
  isPlane,
  LayoutNode,
  PlaneNode,
  TextNode,
} from "@weave/twill";
import { isAxis } from "@weave/twill";
import { CSSProperties, Fragment, useMemo } from "react";
import { scaleLinear } from "d3";

type FigureProps = {
  of: LayoutNode;
  className?: string;
};

export const Figure = ({ of: data, className }: FigureProps) => {
  const width = data.width;
  const height = data.height;
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
  const cname = "weave" + " " + className;
  return (
    <div style={boxcss} className={cname}>
      <svg viewBox={viewbox} preserveAspectRatio={par} style={svgcss}>
        {isPlane(data) && <Plane2D of={data} />}
      </svg>
    </div>
  );
};

type Plane2DProps = {
  of: PlaneNode;
};
export const Plane2D = ({ of }: Plane2DProps) => {
  const children = of.children();
  const shift = of.center();
  return (
    <g transform={shift}>
      {children.map((c) => (
        <Fragment key={c.id}>
          {isAxis(c) && <Axis2D of={c} />}
        </Fragment>
      ))}
    </g>
  );
};
type Axis2DProps = {
  of: AxisNode;
};
export const Axis2D = ({ of }: Axis2DProps) => {
  const domain = of.domain();
  const range = of.range();
  const tickLength = of.TickLength;
  const ticks = useMemo(() => {
    return of.axisTicks();
    // const xscale = of.scaleFn();
    // const width = range[1] - range[0];
    // const px = 30;
    // const nticks = Math.max(1, Math.floor(width / px));
    // return xscale.ticks(nticks).map((value) => ({
    // value,
    // xoffset: xscale(value),
    // }));
  }, [domain.join("-"), range.join("-")]);
  const d = [
    "M",
    range[0],
    tickLength,
    "v",
    -tickLength,
    "H",
    range[1],
    "v",
    tickLength,
  ].join(" ");
  return (
    <g>
      <path
        d={d}
        fill={"none"}
        stroke={"currentColor"}
      />
      {ticks.map((text) => (
        <g key={text.id}>
          <line
            y2={tickLength}
            stroke={text.FontColor}
            transform={`translate(${text.x}, ${0})`}
          />
          <Label of={text} />
        </g>
      ))}
    </g>
  );
};

// <g key={value} transform={`translate(${xoffset},0)`}>
// <line y2={"6"} stroke={"currentColor"} />
// <text
// style={{
// fontSize: "12px",
// textAnchor: "middle",
// transform: "translateY(20px)",
// }}
// >
// {value}
// </text>
// </g>
export type LabelProps = {
  of: TextNode;
};
export const Label = ({ of: data }: LabelProps) => {
  const x = data.x;
  const y = data.y;
  return (
    <g transform={`translate(${x},${20})`}>
      <text
        fontSize={data.FontSize}
        fontFamily={data.FontFamily}
        fill={data.FontColor}
        textAnchor={data.anchor}
      >
        {data.content}
      </text>
    </g>
  );
};
