import { Integral } from "@weave/twill";

type IntegrationProps = {
  of: Integral;
};
export const Integration = ({ of }: IntegrationProps) => {
  return (
    <g>
      <path
        d={of.area()}
        opacity={of.opacityValue || 0.3}
        strokeWidth={of.strokeWidth || 1}
        fill={of.fillColor || "gold"}
      />
    </g>
  );
};
