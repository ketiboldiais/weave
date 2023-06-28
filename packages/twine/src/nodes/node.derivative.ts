import { Token } from "../token";
import { ASTNode } from "./node.ast";
import { Visitor } from "./node.visitor";

export class Derivative extends ASTNode {
  accept<t>(visitor: Visitor<any>): t {
    return visitor.derivative(this);
  }
  name: Token;
  params: Token[];
  body: ASTNode;
  order: number;
  constructor(name: Token, params: Token[], body: ASTNode, order: number) {
    super("derivative");
    this.name = name;
    this.params = params;
    this.body = body;
    this.order = order;
  }
	hasParam(lexeme:string) {
		let out = false;
		for (let i = 0; i < this.params.length; i++) {
			const param = this.params[i];
			if (param._lexeme === lexeme) out = true;
		}
		return out;
	}
}

export const nDerivative = (
  name: Token,
  params: Token[],
  body: ASTNode,
  order: number,
) => (
  new Derivative(name, params, body, order)
);
