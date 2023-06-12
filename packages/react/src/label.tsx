import { CSSProperties, useState, useEffect } from "react";
import { TextNode } from "@weave/twill";

export type LabelProps = {
  of: TextNode;
  anchor?: "start" | "middle" | "end";
  position?: string;
};

export const Label = ({
  of: data,
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
        textAnchor={data.anchor || "middle"}
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
