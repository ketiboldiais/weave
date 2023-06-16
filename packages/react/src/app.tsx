import { tree, subtree, leaf, graph, vertex, forceSpring } from '@weave/twill';
import { Figure } from './figure';


const bleft = subtree('5').nodes([leaf('7'), leaf('y'), leaf('8')]);
const cleft = subtree('4').nodes([leaf('g'), leaf('j'), leaf('i')]);
const tree1 = tree('1').nodes([
  subtree('2').nodes([cleft, leaf('9')]),
  subtree('3').nodes([bleft, leaf('b')]),
]);
tree1.ala('buccheim-unger-leipert');
tree1.gridlines('xy');

const Tree = () => {
  return <Figure of={tree1} />;
};


export const App = () => {
  return (
    <div>
    </div>
  );
};
