import { axis, plot } from "@weave/loom";
import { Figure } from "../components/figure";
import { plane } from "@weave/loom";

const plot1 = plane([
  axis("x").sep(2),
  axis("y").sep(2).hide("zero"),
  plot("f(x) = 1/x").sampled(100),
]).margin(10, 10).size(300,300).figure();

export const Plot1 = () => {
  return <Figure of={plot1} />;
};

