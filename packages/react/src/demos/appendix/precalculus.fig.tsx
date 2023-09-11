import {plane, quad} from '../../loom'
import {Figure} from '../Screen'

export const NumberSets = () => {
	const shapes = [
		quad(20,20).at(-10,10).fill('none').stroke('white'),
		quad(16,10).at(-8,5).fill('none').stroke('white'),
		quad(16,10).at(-5,5).fill('none').stroke('white'),
	]
	const d = plane()
	.children(shapes)
	.end()
	return <Figure of={d}/>
}