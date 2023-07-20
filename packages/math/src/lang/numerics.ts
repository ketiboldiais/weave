import { compose, pipe } from "./util";

type Ok<T, D> = {
  erred: false;
  result: T;
  data: D;
};
type Fail<E, D> = {
  erred: true;
  error: E;
  data: D;
};
type Result<T, E, D> = Ok<T, D> | Fail<E, D>;
type Calc<T, E, D> = {
  erred: boolean;
  error: E;
  result: T;
  data: D;
};
export const fail = <T, E, D, E2>(
  state: Calc<T, E, D>,
  error: E2,
): Calc<T, E2, D> => ({ ...state, erred: true, error });

type StateFn<T, E = any, D = any> = (
  state: Calc<any, any, any>,
) => Calc<T, E, D>;
type InputType = number | number[];
const enstate = <D>(
  data: D | null = null,
): Calc<null, InputType | null, D | null> => ({
  erred: false,
  error: null,
  result: null,
  data,
});
export const succeed = <T, E, D, T2>(
  state: Calc<T, E, D>,
  result: T2,
): Calc<T2, E, D> => ({ ...state, result });

class Computation<T, E = string, D = any> {
  p: StateFn<T, E, D>;
  constructor(p: StateFn<T, E, D>) {
    this.p = p;
  }
  map<T2>(fn: (x: T) => T2) {
    const p = this.p;
    return new Computation((state) => {
      const newstate = p(state);
      if (newstate.erred) return newstate as unknown as Calc<T2, E, D>;
      return succeed(newstate, fn(newstate.result));
    });
  }
  ap<T2>(pfn: Computation<(x: T) => T2, E, D>): Computation<T2, E, D> {
    const p = this.p;
    return new Computation((state) => {
      if (state.erred) return state;
      const argstate = p(state);
      if (argstate.erred) return argstate;
      const fnState = pfn.p(argstate);
      if (fnState.erred) return fnState;
      return succeed(fnState, fnState.result(argstate.result));
    });
  }
  chain<T2>(fn: (x?: T) => Computation<T2, E, D>): Computation<T2, E, D> {
    const p = this.p;
    return new Computation((state): Calc<T2, E, D> => {
      const newState = p(state);
      if (newState.erred) return newState as unknown as Calc<T2, E, D>;
      return fn(newState.result).p(newState);
    });
  }
  run(arg: number | number[]): Result<T, E, D> {
    const state = enstate(arg);
    const result = this.p(state);
    if (result.erred) {
      return {
        erred: true,
        error: result.error,
        data: result.data,
      };
    } else {
      return {
        erred: false,
        result: result.result,
        data: result.data,
      };
    }
  }
}


