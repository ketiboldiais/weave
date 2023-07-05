import { v2, Vector } from "@weave/math";

class Quad {
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number,
  ) {
  }
}

const quad = (x: number, y: number, w: number, h: number) => (
  new Quad(x, y, w, h)
);

class QuadTree {
  points: Vector[] = [];
  I: QuadTree | null = null;
  II: QuadTree | null = null;
  III: QuadTree | null = null;
  IV: QuadTree | null = null;
  constructor(
    public boundary: Quad,
    public capacity: number,
  ) {}
  subdivide() {
		
  }
  push(point: Vector) {
    if (this.points.length < this.capacity) {
      this.points.push(point);
    } else {
      this.subdivide();
    }
  }
}

const quadtree = (boundary: Quad, capacity: number) => (
  new QuadTree(boundary, capacity)
);
