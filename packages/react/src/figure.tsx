import { Plane2D } from './plane2d';
import { isPlane, isSpringGraph, isTreeSpace, LayoutNode } from '@weave/twill';
import { CSSProperties } from 'react';
import { Tree } from './tree';
import { Axis2D } from './axis2d';
import { GraphFigure } from './graph';

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
    display: 'inline-block',
    position: 'relative',
    width: '100%',
    paddingBottom,
    overflow: 'hidden',
    border: 'solid thin lightgrey',
  };
  const svgcss: CSSProperties = {
    display: 'inline-block',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
  };
  const par = 'xMidYMid meet';
  const cname = 'weave' + ' ' + className;
  const gridlines = data.GridLines;
  const shift = data.center();
  const axes = data.Axes;
  return (
    <div style={boxcss} className={cname}>
      <svg viewBox={viewbox} preserveAspectRatio={par} style={svgcss}>
        <g transform={shift}>
          {axes.map((a) => (
            <Axis2D key={a.id} of={a} />
          ))}
          {gridlines.length !== 0 && (
            <g>
              {gridlines.map((d, i) => (
                <line
                  key={'grid-line' + d.id + i}
                  x1={d.x1}
                  y1={d.y1}
                  x2={d.x2}
                  y2={d.y2}
                  stroke={d.strokeColor ? d.strokeColor : 'currentColor'}
                  strokeWidth={d.strokeWidth || 1}
                  opacity={d.opacityValue || 0.1}
                />
              ))}
            </g>
          )}
          {isPlane(data) && <Plane2D of={data} />}
          {isTreeSpace(data) && <Tree of={data} />}
          {isSpringGraph(data) && <GraphFigure of={data}/>}
        </g>
      </svg>
    </div>
  );
};
