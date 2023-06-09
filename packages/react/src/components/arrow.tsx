import { ArrowDefNode } from "@weave/loom";

export const Arrow = ({ of }: { of: ArrowDefNode }) => {
  return (
    <marker
      id={`${of.id}`}
      orient={of.orient}
      viewBox={of.viewBox}
      markerWidth={of.markerWidth}
      markerHeight={of.markerHeight}
      refX={of.refX}
      refY={of.refY}
    >
      <g>
        <path
          d={of.d}
          fill={of.strokeColor}
        />
      </g>
    </marker>
  );
};
