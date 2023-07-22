import { tt } from "./enums.js";
import { algebraError, Err } from "./err.js";
import {
  diff,
  Expression,
  Int,
  int,
  isatom,
  iscompound,
  isfrac,
  isint,
  issum,
  power,
  product,
  quotient,
  rational,
  sum,
  sym,
} from "./nodes.algebra.js";
import {
  AlgebraicVisitor,
  AssignExpr,
  Binary,
  Expr,
  Float,
  FnCall,
  Group,
  Integer,
  Literal,
  LogicalExpr,
  MatrixExpr,
  NativeCall,
  NotExpr,
  RelationExpr,
  Variable,
  VectorExpr,
} from "./nodes.core.js";
import { Fraction, isset, Left, left, print, Right, right } from "./util.js";

type Result = Right<Expression> | Left<Err>;

class Reducer implements AlgebraicVisitor<Result> {
  error: Err | null = null;
  apply(expression: Left<Err> | Right<Expr>) {
    return expression.map((c) => this.ap(c));
  }
  ap(node: Expr) {
    const out = node.map(this);
    return out;
  }
  int(node: Integer): Result {
    return right(int(node.n));
  }
  symbol(node: Variable): Result {
    return right(sym(node.name.lex));
  }
  binary(node: Binary): Result {
    const L = this.ap(node.left);
    if (L.isLeft()) return L;
    const R = this.ap(node.right);
    if (R.isLeft()) return R;
    const op = node.op.tokenType;
    const out = L.chain((a) =>
      R.map((b) => {
        if (op === tt.plus) {
          if (isint(a) && isint(b)) {
            return int(a.value + b.value);
          } else if (isint(a) && isfrac(b)) {
            return rational(Fraction.from(a.value).add(b.value));
          } else if (isfrac(a) && isint(b)) {
            return rational(Fraction.from(b.value).add(a.value));
          } else {
            return sum([a, b]).gather();
          }
        }
        if (op === tt.star) {
          if (issum(a) && isatom(b)) {
            return a.rightDistribute(b);
          }
          if (isatom(a) && issum(b)) {
            return b.leftDistribute(a);
          }
          return product([a, b]);
        }
        if (op === tt.slash) {
          if (isint(a) && isint(b)) {
            return rational([a.value, b.value]);
          } else {
            return quotient([a, b]);
          }
        }
        if (op === tt.minus) {
          return diff([a, b]);
        }
        if (op === tt.caret) {
          return power([a, b]);
        }
        return algebraError(`Invalid operand: ${tt[op]}`);
      })
    );
    return out as Result;
  }
  nativeCall(node: NativeCall): Result {
    return left(algebraError(`native call`));
  }
  group(node: Group): Result {
    const out = this.ap(node.expression);
    return out.map((c) => {
      if (iscompound(c)) {
        c.tickParen();
      }
      return c;
    });
  }
  float(node: Float): Result {
    return left(algebraError(`float`));
  }
  literal(node: Literal): Result {
    return left(algebraError(`literal`));
  }
  vector(node: VectorExpr): Result {
    return left(algebraError(`vector`));
  }
  matrix(node: MatrixExpr): Result {
    return left(algebraError(`matrix`));
  }
  fnCall(node: FnCall): Result {
    return left(algebraError(`Fn-call`));
  }

  relation(node: RelationExpr): Result {
    return left(algebraError(`Relations`));
  }
  notExpr(node: NotExpr): Result {
    return left(algebraError(`Not`));
  }
  logicExpr(node: LogicalExpr): Result {
    return left(algebraError(`Logic`));
  }
  assign(node: AssignExpr): Result {
    return left(algebraError(`Assign`));
  }
}

export const reduce = (expr: Left<Err> | Right<Expr>) => (
  new Reducer().apply(expr)
);
