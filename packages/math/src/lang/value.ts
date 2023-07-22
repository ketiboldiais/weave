import { Matrix } from "../matrix.js";
import { Vector } from "../vector.js";
import { Fn } from "./visitor.interpreter";

export type Value =
  | string
  | number
  | null
  | boolean
  | Value[]
  | (Value[])[]
  | Vector
  | Matrix
  | Set<Value>
  | Fn;
