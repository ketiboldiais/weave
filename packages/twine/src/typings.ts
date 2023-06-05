import { Compiler } from "./compiler.js";

export type RVal =
  | number
  | boolean
  | null
  | string
  | Callable
  | RVal[];

export abstract class Callable {
  abstract call(compiler: Compiler, args: RVal[]): RVal;
  abstract arity(): number;
}
