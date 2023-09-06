import {circle, line, plane, text} from '../../loom'
import {Figure} from '../Screen'

export const Intersection1 = () => {
	const d = plane([-5,5],[-5,5])
		.margins(0,0,10,0)
		.height(110)
		.width(400)
		.and(
			circle(5).fill('tomato').opacity(0.6).at(-0.2,0).stroke('none'),
			circle(5).fill('gold').opacity(0.3).at(0.2,0).stroke('none'),
			text('A').at(-1.2,1.2).fontColor('white').mode('LaTeX'),
			text('B').at(0.9,1.2).fontColor('white').mode('LaTeX'),
			text('A \\cap B').at(-0.5,-4).fontColor('white').mode('LaTeX'),
			line([0,-3.5], [0,-2.5]).stroke('white').arrowEnd()
		)
		.end();
	return (
		<Figure of={d}/>
	)
}