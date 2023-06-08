import { expect, it } from "vitest";
import { box, one } from "../src/index";

it("should parse on character.", () => {
  const src = "a";
  const p = one("a");
  const r = p.parse(src);
  const e = { ...r, result: box('a') };
  expect(r).toEqual(e);
});
