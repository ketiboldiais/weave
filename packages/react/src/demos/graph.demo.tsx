import { axis, forceSpace, graph } from "@weave/loom";
import { L } from "../components/line";
import { Fragment } from "react";
import { Figure } from "../components/figure.js";

const d = forceSpace(graph({
  a: ["b"],
  b: ["c", "d"],
  c: ["e"],
})).w(200).h(200).x(-5,5).y(-5,5).figure();

export const ForceGraph1 = () => {
  return <Figure of={d} />;
};
