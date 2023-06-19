import {Base} from './base';
import {colorable} from './colorable';
import {Line, line} from './index.js';
import {scopable} from './scopable.js';
import {typed} from './typed';
import {Vector, vector} from './vector.js';

type AngleUnit = 'deg'|'rad';
const ANGLE = typed(colorable(scopable(Base)));
export class Angle extends ANGLE {
	value:number;
	unit: AngleUnit;
	origin: Vector;
	initial: Line;
	terminal: Line;
	constructor(value:number, unit:AngleUnit) {
		super();
		this.type = 'angle';
		this.value=value;
		this.unit = unit;
		this.origin = vector(0,0);
		this.initial = line(this.origin, [0,1]);
		this.terminal = line(this.origin, [1,0]);
	}
	tsl(value:number) {
		return this;
	}
	isl(value:number) {
		return this;
	}
	vertex(x:number,y:number) {
		this.origin = vector(x,y);
		return this;
	}
}

export const angle = (measure:number,unit:AngleUnit) => {
	return new Angle(measure, unit)
}

