import { IntegralNode } from "@weave/twill";

type IntegrationProps = {
  of: IntegralNode;
};
export const Integration = ({ of }: IntegrationProps) => {
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
