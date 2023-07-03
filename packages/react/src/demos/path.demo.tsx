import { axis, color, path, plot, rect } from "@weave/loom";
import { Figure } from "../components/figure";
import { plane } from "@weave/loom";
import { Fragment } from "react";
const path1 = plane([
	rect(2,4).fill(color('coral')),
	rect(2,4).fill(color('coral').compliment()).opacity(0.5).rotate('45deg'),
	rect(2,4).fill(color('yellowgreen')).opacity(0.5).shearX(2),
]).margin(10, 10).w(300).h(300).gridlines("xy").figure();

export const Path1 = () => {
  return (
    <Fragment>
      <Figure of={path1} />
    </Fragment>
  );
};
