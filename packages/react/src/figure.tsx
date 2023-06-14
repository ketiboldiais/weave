import { Plane2D } from "./plane2d";
import {
  Graph,
  isGraph,
  isPlane,
  isTreeSpace,
  LayoutNode,
} from "@weave/twill";
import { CSSProperties, Fragment } from "react";
import { Tree } from "./tree";
import { Axis2D } from "./axis2d";
import {Label} from "./label";
import {Line} from "packages/twill/dist/line";

type FigureProps = {
  of: LayoutNode;
  className?: string;
};

export const Figure = ({
  of: data,
  className,
}: FigureProps) => {
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
  const gridlines = data.GridLines;
  const shift = data.center();
  const axes = data.Axes;
  return (
    <div style={boxcss} className={cname}>
      <svg
        viewBox={viewbox}
        preserveAspectRatio={par}
        style={svgcss}
      >
        <g transform={shift}>
          {axes.map((a) => (
            <Axis2D key={a.id} of={a} />
          ))}
          {gridlines.length !== 0 && (
            <g>
              {gridlines.map((d, i) => (
                <line
                  key={"grid-line" + d.id + i}
                  x1={d.x1}
                  y1={d.y1}
                  x2={d.x2}
                  y2={d.y2}
                  stroke={
                    d.strokeColor
                      ? d.strokeColor
                      : "currentColor"
                  }
                  strokeWidth={d.strokeWidth || 1}
                  opacity={d.opacityValue || 0.1}
                />
              ))}
            </g>
          )}
          {isPlane(data) && <Plane2D of={data} />}
          {isTreeSpace(data) && <Tree of={data} />}
          {isGraph(data) && <GraphFig of={data}/>}
        </g>
      </svg>
    </div>
  );
};

export const GraphFig = ({ of }: { of: Graph }) => {
  const nodes = of.data.nodes;
  const edges = of.data.edges;
  const xs = of.scaleOf("x");
  const ys = of.scaleOf("y");
  const shift = (x: number, y: number) =>
    `translate(${xs(x)},${ys(y)})`;
  console.log({nodes,edges});
  return (
    <g>
      <g>
        {edges.map(e => (
          <Fragment key={e.id}>
            <line
              x1={xs(e.source.cx)}
              y1={ys(e.source.cy)}
              x2={xs(e.target.cx)}
              y2={ys(e.target.cy)}
              stroke={e.strokeColor||'currentColor'}
              strokeWidth={e.strokeWidth||1}
              strokeDasharray={e.strokeDashArray||0}
            />
          </Fragment>
        ))}
      </g>
      <g>
        {nodes.map((v) => (
          <g key={v.id} transform={shift(v.cx, v.cy)}>
            <circle
              r={v.r}
              fill={v.fillColor || "white"}
              stroke={v.strokeColor || "currentColor"}
            />
            <Label of={v} position={`translate(0,-6)`}/>
          </g>
        ))}
      </g>
    </g>
  );
};
