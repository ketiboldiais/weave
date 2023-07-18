import { axis, plot, space } from "@weave/loom";
import { Figure } from "../components/figure";
import { plane } from "@weave/loom";

const plot1 = plane([
  axis("x").sep(2),
  axis("y").sep(2).hide("zero"),
  plot("f(x) = 1/x").sampled(100),
]).context(space(300,300).margin(10,10)).figure();

export const Plot1 = () => {
  return <Figure of={plot1} />;
};

