import {
  AxisNode,
  IntegralNode,
  isLine,
  isPlane,
  isPlot,
  isTextNode,
  isTree,
  LayoutNode,
  LineNode,
  PlaneNode,
  PlotNode,
  Scaler,
  TextNode,
  TreeNode,
} from "@weave/twill";
import { isAxis, isIntegral } from "@weave/twill";
import {
  CSSProperties,
  Fragment,
  useEffect,
  useMemo,
  useState,
} from "react";

type FigureProps = {
  of: LayoutNode | TreeNode;
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
  return (
    <div style={boxcss} className={cname}>
      <svg
        viewBox={viewbox}
        preserveAspectRatio={par}
        style={svgcss}
      >
        <g transform={shift}>
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
        </g>
      </svg>
    </div>
  );
};

const Line = ({
  of,
  xs,
  ys,
}: {
  of: LineNode;
  xs: Scaler;
  ys: Scaler;
}) => {
  return (
    <line
      x1={xs(of.x1)}
      y1={ys(of.y1)}
      x2={xs(of.x2)}
      y2={ys(of.y2)}
      stroke={of.strokeColor || "currentColor"}
      strokeWidth={of.strokeWidth || 1}
      opacity={of.opacityValue || 1}
    />
  );
};

type Plane2DProps = {
  of: PlaneNode;
};
export const Plane2D = ({ of }: Plane2DProps) => {
  const children = of.children();
  return (
    <g>
      {children.map((c) => (
        <Fragment key={c.id}>
          {isAxis(c) && <Axis2D of={c} />}
          {isPlot(c) && <Curve2D of={c} />}
          {isTextNode(c) && <Label of={c} />}
        </Fragment>
      ))}
    </g>
  );
};

type Curve2DProps = {
  of: PlotNode;
};
export const Curve2D = ({ of }: Curve2DProps) => {
  const d = of.path();
  const hasChildren = of.children.length !== 0;
  return (
    <Fragment>
      <g>
        <path
          d={d}
          fill={of.fillColor || "none"}
          stroke={of.strokeColor || "tomato"}
          strokeWidth={of.strokeWidth || 1}
        />
      </g>
      {hasChildren &&
        of.children.map((c) => (
          <Fragment key={c.id}>
            {isIntegral(c) && <Integration of={c} />}
          </Fragment>
        ))}
    </Fragment>
  );
};

type IntegrationProps = {
  of: IntegralNode;
};
const Integration = ({ of }: IntegrationProps) => {
  return (
    <g className={of.klasse()}>
      <path
        d={of.area()}
        opacity={of.opacityValue || 0.3}
        strokeWidth={of.strokeWidth || 1}
        fill={of.fillColor || "gold"}
      />
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
  const isX = of.is("x");
  const ticks = useMemo(() => {
    return of.axisTicks();
  }, [domain.join("-"), range.join("-")]);
  const translation = (
    text: TextNode,
    other: number = 0,
    dx: number = 0,
    dy: number = 0
  ) => {
    if (isX) {
      return `translate(${text.x + dx}, ${other + dy})`;
    }
    return `translate(${0 + dx}, ${text.y + dy})`;
  };
  const rotate = isX ? "rotate(0)" : "rotate(90)";
  const translateXY = of.translationXY();
  return (
    <g transform={translateXY}>
      <g transform={rotate}>
        {!of.hasNo("axis-line") && (
          <path
            d={[
              "M",
              range[0],
              tickLength,
              "v",
              -tickLength,
              "H",
              range[1],
              "v",
              tickLength,
            ].join(" ")}
            fill={"none"}
            stroke={"currentColor"}
          />
        )}
      </g>
      {!of.hasNo("ticks") &&
        ticks.map((text) => (
          <g key={text.id}>
            <line
              y1={-tickLength}
              y2={tickLength}
              stroke={text.FontColor}
              transform={translation(text) + " " + rotate}
            />
            <Label
              of={text}
              anchor={
                text.anchor
                  ? text.anchor
                  : isX
                  ? "middle"
                  : "end"
              }
              position={translation(
                text,
                20,
                isX ? 0 : -10,
                isX ? 0 : 3
              )}
            />
          </g>
        ))}
    </g>
  );
};

export type LabelProps = {
  of: TextNode;
  anchor?: "start" | "middle" | "end";
  position?: string;
};
export const Label = ({
  of: data,
  anchor = "middle",
  position,
}: LabelProps) => {
  const content = data.content;
  const space = data.space();
  const xscale = space.scaleOf("x");
  const yscale = space.scaleOf("y");
  const x = xscale(data.x);
  const y = yscale(data.y);
  const mode = data.mode;
  const translate = position
    ? position
    : `translate(${x},${y})`;
  if (mode === "latex-block" || mode === "latex-inline") {
    return (
      <g transform={translate}>
        <foreignObject
          width={"1"}
          height={"1"}
          overflow={"visible"}
        >
          <Tex
            of={data}
            style={{
              height: "fit-content",
              width: "fit-content",
              fontSize: data.FontSize,
              color: data.FontColor,
              margin: "-1em 0",
            }}
          />
        </foreignObject>
      </g>
    );
  }
  return (
    <g transform={translate}>
      <text
        fontSize={data.FontSize}
        fontFamily={data.FontFamily}
        fill={data.FontColor}
        textAnchor={anchor}
      >
        {content}
      </text>
    </g>
  );
};
import katex from "katex";
type Html = { __html: string };
const html = (__html: string): Html => ({ __html });
export const Tex = ({
  of: data,
  style,
}: {
  of: TextNode;
  style?: CSSProperties;
}) => {
  const content = data.content;
  const mode =
    data.mode === "latex-block" ? "block" : "inline";
  const Component = mode === "block" ? "div" : "span";
  const displayMode = mode === "block";
  const [state, enstate] = useState(html(""));
  useEffect(() => {
    try {
      const data = katex.renderToString(content, {
        displayMode,
        throwOnError: false,
        output: "mathml",
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
