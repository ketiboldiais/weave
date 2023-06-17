import { isnum, isstr, randFloat, randInt, unsafe } from "./aux.js";
import { Edge, Graph, graph, Vertex } from "./graph.js";
import {
  circle,
  CircleNode,
  FigNode,
  line,
  LineNode,
  Space,
  vector,
} from "./index.js";
import { typed } from "./typed.js";
import { Vector } from "./vector.js";

class Mass {
  key: string;
  data: Vertex;
  POSITION: Vector;
  MASS: number;
  ACCELERATION: Vector;
  VELOCITY: Vector;
  constructor(vertex: Vertex) {
    this.key = vertex.key;
    this.data = vertex;
    this.POSITION = vector(0, 0);
    this.ACCELERATION = vector(0, 0);
    this.VELOCITY = vector(0, 0);
    this.MASS = 300;
  }
  applyForce(force: Vector) {
  }
  place() {
  }
  /**
   * Updates this mass’s position.
   */
  move(newPosition: Vector) {
    this.POSITION = newPosition;
    return this;
  }
}

const mass = (vertex: Vertex) => {
  return new Mass(vertex);
};

class Spring {
  source: Mass;
  target: Mass;
  data: Edge;
  LENGTH: number = 1;
  constructor(source: Mass, target: Mass, edge: Edge) {
    this.source = source;
    this.target = target;
    this.data = edge;
  }
}

const spring = (source: Mass, target: Mass, edge: Edge) => {
  return new Spring(source, target, edge);
};

const GSPACE = typed(Space);

export class Eades extends GSPACE {
  nodes: Record<string, Mass>;
  forEachNode(callback: (node: Mass, index: number) => void) {
    let i = 0;
    for (const key in this.nodes) {
      const node = this.nodes[key];
      callback(node, i++);
    }
    return this;
  }

  springs: Record<string, Spring>;
  forEachSpring(callback: (spring: Spring) => void) {
    for (const key in this.springs) {
      const spring = this.springs[key];
      callback(spring);
    }
  }

  graph: Graph;

  STIFFNESS: number = 1;
  REPULSION: number = 1;
  DAMPING: number = 0.00001;
  MIN_ENERGY_THRESHOLD: number = 0.00001;
  MAX_SPEED: number = 139;
  ITERATIONS: number = 100;

  scaleY(value: number) {
    return this.scaleOf("y")(value);
  }
  scaleX(value: number) {
    return this.scaleOf("x")(value);
  }

  private scatter() {
    this.forEachNode((node) => {
    });
  }
  private toCenter() {
  }

  private repel() {
  }

  private attract() {
  }
  private updateVelocity(time: number) {
  }
  private updatePosition(time: number) {
  }

  private applyForce() {
  }

  private totalEnergy() {
  }

  figure() {
  }

  constructor(graph: Graph) {
    super();
    this.graph = graph;
    this.type = "force-spring-graph";
    this.nodes = {};
    this.springs = {};
    for (const key in graph.nodes) {
      const node = graph.nodes[key];
      this.nodes[key] = mass(node);
    }
    const keys = new Set<string>();
    for (const key in graph.edges) {
      const edge = graph.edges[key];
      const source = this.nodes[edge.source];
      const target = this.nodes[edge.target];
      if (!keys.has(key)) {
        this.springs[key] = spring(source, target, edge);
        keys.add(key).add(edge.rkey);
      }
    }
  }

  edges(): LineNode[] {
    const out: LineNode[] = [];
    const keys = new Set<string>();
    Object.values(this.springs).forEach((spring) => {
    });
    return out;
  }

  vertices(): CircleNode[] {
    const out: CircleNode[] = [];
    Object.values(this.nodes).forEach((mass) => {
    });
    return out;
  }
}

export const eades = (graph: Graph) => {
  return new Eades(graph);
};

export const isEades = (node: FigNode): node is Eades => (
  !unsafe(node) && node.isType("force-spring-graph")
);
