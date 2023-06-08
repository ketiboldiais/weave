import { expect, it } from "vitest";
import { list, box, one } from "../src/index";

it("should parse on character.", () => {
  const src = "abc";
  const a = one("a");
  const b = one("b");
  const c = one("c");
  const abc = list([a, b, c]);
  const r = abc.parse(src).result;
	const e = box(['a','b','c']);
  expect(r).toEqual(e);
});
