// @ts-nocheck

figure([
  line([1, 2], [3, 4]),
  line([1, 2], [3, 4]),
  line([1, 2], [3, 4]),
]).dom(-2, 2).ran(-2, 2);

figure([
  plot(`f(x) = x^2`),
  plot(`g(x) = sin x`),
  plot(`h(x) = cos x`),
]).dom(-2, 2).ran(-2, 2);

figure([
  graph({
    a: ['a', 'b', 'c'],
    b: ['a'],
    c: ['f', 'd'],
  })
]);
