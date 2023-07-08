import { choice, list, lit, maybe, regex, word } from "@weave/reed";

const pint = regex(/^[1-9]\d*/);
const zero = regex(/^[0]/);
const minus = lit("-");
const plus = lit("+");
const integer = word([
  maybe(minus).or(plus),
  pint,
]).or(zero);
const float = word([
  maybe(minus).or(plus),
  regex(/^(0|[1-9]\d*)?(\.\d+)?(?<=\d)/),
]);
const slash = lit("/");
const PI = lit("pi").or(lit("PI"));
const rad = lit("rad");
const radians = lit("radians").map((_) => "rad");
const deg = lit("deg").map((_) => "deg");
const degrees = lit("degrees").map((_) => "deg");
const fraction = list([integer, maybe(PI), slash, pint]).map((n: any[]) => {
  if (n.length === 4) {
    let [a, b, c, d] = n;
    const N = (a * 1) * Math.PI;
    const D = d * 1;
    return `${N / D}`;
  }
  if (n.length === 3) {
    let [a, b, c] = n;
    const N = a * 1;
    const D = c * 1;
    return `${N / D}`;
  }
  return "";
});
const rational = list([integer.or(PI), slash, pint]).map((n) => {
  let [a, _, c]: any[] = n;
  if (a === "pi" || a === "PI") {
    a = Math.PI;
  }
  const r = ((a) * 1) / ((c) * 1);
  return `${r}`;
});
const angle_unit = choice([radians, rad, degrees, deg]);
const num = choice([rational, fraction, float, integer, PI]);

export const anglevalue = list([num, maybe(PI), maybe(angle_unit)])
  .map((r: any[]) => {
    if (r.length === 3) {
      const [val, _, u] = r;
      const v = val * 1;
      const p = Math.PI;
      const value = v * p;
      const unit = u;
      return { value, unit };
    } else if (r.length === 2) {
      const [val, u] = r;
      const value = val * 1;
      const unit = u;
      return { value, unit };
    } else {
      const [val] = r;
      const value = val * 1;
      const unit = "rad";
      return { value, unit };
    }
  });

export const parseRadians = (angle: string) =>
  anglevalue.map((r) =>
    r.unit === "deg" ? (r.value * (Math.PI / 180)) : r.value
  ).parse(angle).result.unwrap(0);

export const parseDegrees = (angle: string) =>
  anglevalue.map((r) =>
    r.unit === "rad" ? (r.value * (180 / Math.PI)) : r.value
  ).parse(angle).result.unwrap(0);
