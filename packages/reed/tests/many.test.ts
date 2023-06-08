import { expect, it } from "vitest";
import { box, one, many } from "../src/index";

it("should many 1s.", () => {
  const src = "111";
  const a = one("1");
  const abc = many(a);
  const r = abc.parse(src).result;
	const e = box(['1','1','1']);
  expect(r).toEqual(e);
});
