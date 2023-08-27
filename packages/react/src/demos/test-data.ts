// deno-fmt-ignore
export const heights = [
  60, 60.5, 61, 61, 61.5, 63.5, 63.5, 63.5,
  64, 64, 64, 64, 64, 64, 64, 64.5, 64.5,
  64.5, 64.5, 64.5, 64.5, 64.5, 64.5, 66, 66,
  66, 66, 66, 66, 66, 66, 66, 66, 66.5,
  66.5, 66.5, 66.5, 66.5, 66.5, 66.5,
  66.5, 66.5, 66.5, 66.5, 67, 67, 67, 67,
  67, 67, 67, 67, 67, 67, 67, 67, 67.5,
  67.5, 67.5, 67.5, 67.5, 67.5, 67.5, 68, 68, 69,
  69, 69, 69, 69, 69, 69, 69, 69, 69, 69.5, 69.5,
  69.5, 69.5, 69.5, 70, 70, 70, 70,
  70, 70, 70.5, 70.5, 70.5, 71, 71, 71, 72,
  72, 72, 72.5, 72.5, 73, 73.5, 74,
];
/*
const AXIS = renderable(colorable(BASE));

export class Axis extends AXIS {
  _interval: [number, number];
  _type: "x" | "y";
  _ticks: Line[] = [];
  constructor(type: "x" | "y", interval: [number, number]) {
    super();
    this._interval = interval;
    this._type = type;
    this._stroke = "grey";
  }


  get _min() {
    return this._interval[0];
  }


  get _max() {
    return this._interval[1];
  }
  _tickSep: number = 1;
  _tickLength: number = 0.2;

  end() {
    const tickLength = this._tickLength;
    let xs = range(this._min, this._max + 1, this._tickSep);
    if (this._type === "x") {
      const L = line([this._interval[0], 0], [this._interval[1], 0]);
      this.commands.push(...L.commands);
      xs.forEach((n) => {
        let l = line([n, -tickLength], [n, tickLength])
          .stroke(this._stroke);
        l = l.label(text(n).fontColor(this._stroke), [
          l.firstCommand.end.x,
          l.firstCommand.end.y * 4,
        ]);
        this._ticks.push(l);
      });
    } else {
      const L = line([0, this._interval[0]], [0, this._interval[1]]);
      this.commands.push(...L.commands);
      xs.forEach((n) => {
        let l = line([-tickLength, n], [tickLength, n])
          .stroke(this._stroke);
        l = l.label(text(n).fontColor(this._stroke), [
          l.firstCommand.end.x - 0.4,
          l.firstCommand.end.y - 0.1,
        ]);
        this._ticks.push(l);
      });
    }
    return this;
  }
  interval(x: number, y: number) {
    this._interval = [x, y];
    return this;
  }
}


export function axis(type: "x" | "y", interval: [number, number] = [-10, 10]) {
  return new Axis(type, interval);
}
*/