import { choice, digits, list, lit, maybe, regex, word } from "@weave/reed";
import {Angle, AngleUnit} from './angle.js';

const pint = regex(/^[1-9]\d*/);
const zero = regex(/^[0]/);
const minus = lit("-");
const plus = lit("+");
const integer = word([
  maybe(minus).or(plus),
  pint
]).or(zero);
const float = word([
  maybe(minus).or(plus),
  regex(/^(0|[1-9]\d*)?(\.\d+)?(?<=\d)/),
]);
const slash = lit("/");
const PI = lit("pi").or(lit('PI'));
const rad = lit("rad");
const radians = lit("radians").map(_ => 'rad');
const deg = lit("deg").map(_ => 'deg');
const degrees = lit("degrees").map(_ => 'deg');
const rational = word([integer,slash,pint]).map(n => {
	const [a,b]:any[] = n.split('/');
	const r = ((a)*1)/((b)*1)
	return `${r}`
})
const angle_unit = choice([radians, rad, degrees, deg]);
const num = choice([rational,float,integer])
export const anglevalue = list([num, maybe(PI), angle_unit])
	.map((r)=>{
		if (r.length===3) {
			const [val,_,u]:any[] = r;
			const v = val * 1;
			const p = Math.PI;
			const value = v*p;
			const unit: AngleUnit = u;
			return {value, unit}
		} else {
			const [val,u]:any[]=r;
			const value = val * 1;
			const unit: AngleUnit = u; 
			return {value, unit};
		}
	});

