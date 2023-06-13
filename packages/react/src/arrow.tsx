import { ArrowDefNode } from "@weave/twill";

export const Arrow = ({ of }: { of: ArrowDefNode }) => {
  return (
    <marker
      id={of.id}
      orient={of.orient}
      viewBox={of.viewBox}
      markerWidth={10}
      markerHeight={5}
      refX={20}
      refY={of.refY}
    >
      <g className={of.klasse()}>
        <path
          d={'M0,-5L10,0L0,5Z'}
          fill={of.strokeColor}
        />
      </g>
    </marker>
  );
};
