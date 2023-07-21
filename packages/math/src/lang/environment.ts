import { Token } from "./token.js";
import { Value } from "./value.js";

export class Environment {
  private values: Map<string, Value>;
  parent: Environment | null;
  constructor(parent: Environment | null) {
    this.values = new Map();
    this.parent = parent;
  }
  private formatMessage(line: number, message: string) {
    return `On line ${line}, from the environment: ${message}`;
  }
  define(name: string, value: Value): Value {
    this.values.set(name, value);
    return value;
  }
  ancestor(distance: number) {
    // @ts-ignore
    let env = this;
    for (let i = 0; i < distance; i++) {
      // @ts-ignore
      env = this.parent;
    }
    return env;
  }
  getAt(distance: number, name: string): Value {
    return this.ancestor(distance).values.get(name)!;
  }
  assignAt(distance: number, name: Token, value: Value): Value {
    this.ancestor(distance).values.set(name.lex, value);
    return value;
  }
  assign(name: Token, value: Value): Value {
    if (this.values.has(name.lex)) {
      this.values.set(name.lex, value);
      return value;
    }
    if (this.parent !== null) {
      return this.parent.assign(name, value);
    }
    const erm = this.formatMessage(
      name.line,
      `The user sought to assign a value to “${name.lex}”, but no such name is defined to begin with.`,
    );
    throw new Error(erm);
  }
  get(name: Token): Value {
    if (this.values.has(name.lex)) {
      return this.values.get(name.lex)!;
    }
    if (this.parent !== null) {
      return this.parent.get(name);
    }
    const erm = this.formatMessage(
      name.line,
      `The user asked for the value of “${name.lex}”, but no such name is defined.`,
    );
    throw new Error(erm);
  }
}

/**
 * Creates a new environment.
 *
 * @param parent - The parent of the returned environment. If
 * a value is not found in the returned environment, the parent
 * will be searched.
 */
export const env = (parent: Environment | null) => (
  new Environment(parent)
);
