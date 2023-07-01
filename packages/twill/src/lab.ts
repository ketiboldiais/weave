// @ts-nocheck

const b1 = figure(binaryTree([3, 2, 7, 5, 9]));

const rbt = figure(
	redBlackTree([8, 2, 5, 7, 0])
).width(500).height(500);

const g = figure(graph({
  a: ["b"],
  b: ["c", "d"],
}));

const g = figure(digraph({
  a: ["b"],
  b: ["c", "d"],
}));

const p = figure(
	plot(`f(x) = x^2`),
	axis('x'),
	axis('y'),
);

