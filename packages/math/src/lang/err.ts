export type ErrType = "lexical" | "syntax" | "binding" | "type" | "algebra-runtime";
/**
 * Error messages are kept in `Err`
 * objects.
 */
export class Err {
  message: string;
  type: ErrType;
  constructor(message: string, type: ErrType) {
    this.message = message;
    this.type = type;
  }
}

/**
 * Returns a new parser error.
 */
export const parserError = (message: string) => (
  new Err(message, "syntax")
);
/**
 * Returns a new lexical error.
 */
export const lexicalError = (message: string) => (
  new Err(message, "lexical")
);

export const algebraError = (message: string) => (
  new Err(message, 'algebra-runtime')
);
