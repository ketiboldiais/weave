import { axis, plane, plot } from "@weave/twill";
import { Figure } from "./figure";

const PlotTest = () => {
  const fig = plane([
    plot("f(x) = x^2"),
    plot("f(x) = cos(x)"),
    axis("x").ticks(10),
  ]);
  return <Figure of={fig} />;
};

export const App = () => {
  return (
    <div>
      <PlotTest />
    </div>
  );
};
