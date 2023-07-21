import { Fn } from "./visitor.interpreter";

export type Value =
  | string
  | number
  | null
  | boolean
  | Value[]
  | Set<Value>
  | Fn;
