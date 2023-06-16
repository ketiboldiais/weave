import { SpringGraph, line } from '@weave/twill';
import { Fragment } from 'react';
import { Line } from './tree';

export const GraphFigure = ({ of }: { of: SpringGraph }) => {
  const nodes = Object.values(of.nodes);
  const edges = of.edges;
  console.log({ nodes, edges });
  const xs = of.scaleOf('x');
  const ys = of.scaleOf('y');
  const shift = (x: number, y: number) => `translate(${((x))},${(y)})`;
  return (
    <g>
      {edges.map((e) => (
        <Fragment key={e.id}>
          <line
            x1={(e.source.position.x)}
            y1={(e.source.position.y)}
            x2={(e.target.position.x)}
            y2={(e.target.position.y)}
            stroke={'currentColor'}
            strokeWidth={1}
          />
        </Fragment>
      ))}
      {nodes.map((n) => (
        <g key={n.id} transform={shift(n.position.x, n.position.y)}>
          <circle r={n.r} stroke={'currentColor'} strokeWidth={1} fill={'tomato'} />
          <text fontSize={'11px'} fontFamily={'system-ui'} dy={10}>
            {n.label}
          </text>
        </g>
      ))}
    </g>
  );
};
