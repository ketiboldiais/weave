import { clamp, toDegrees, mod, v3, Vector, vector } from "@weave/math";
import { anglevalue } from "./parsers.js";

type MODEL = "rgb" | "hsl" | "rgba" | "hsla";

const colors = {
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkgrey: "#a9a9a9",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  goldenrod: "#daa520",
  gold: "#ffd700",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  grey: "#808080",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavenderblush: "#fff0f5",
  lavender: "#e6e6fa",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightgrey: "#d3d3d3",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  rebeccapurple: "#663399",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32",
} as const;

export class Color {
  vals: Vector;
  model: MODEL;
  constructor(color: Vector, model: MODEL) {
    this.vals = color;
    this.model = model;
  }
  namedColor() {
  }
  compliment() {
    const out = this.toHSL();
    out.vals.x = mod(out.vals.x + 180, 360);
    return out;
  }
  rotate(angle: number | string) {
    const hsl = this.toHSL();
    const theta = typeof angle === "string"
      ? anglevalue
        .map((r) => (r.unit === "rad" ? toDegrees(r.value) : r.value))
        .parse(angle)
        .result.unwrap(0)
      : angle;
    hsl.vals.x = mod(hsl.vals.x + theta, 360);
    return hsl;
  }
  toRGB() {
    if (this.model === "rgb" || this.model === "rgba") {
      return new Color(this.vals, this.model);
    }
    const h = this.vals.x;
    const s = this.vals.y / 100;
    const l = this.vals.z / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number, k: number = (n + h / 30) % 12) =>
      l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    const r = f(0) * 255;
    const g = f(8) * 255;
    const b = f(4) * 255;
    if (this.model === "hsla") {
      return new Color(vector(r, g, b, this.vals.w), "rgba");
    }
    return new Color(v3(r, g, b), "rgb");
  }
  toHSL() {
    if (this.model === "hsl" || this.model === "hsla") {
      return new Color(this.vals, this.model);
    }
    const r = this.vals.x / 255;
    const g = this.vals.y / 255;
    const b = this.vals.z / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const add = max + min;
    const hue = min === max
      ? 0
      : r === max
      ? ((60 * (g - b)) / diff + 360) % 360
      : g === max
      ? (60 * (b - r)) / diff + 120
      : (60 * (r - g)) / diff + 240;
    const lum = 0.5 * add;
    const sat = lum === 0
      ? 0
      : lum === 1
      ? 1
      : lum <= 0.5
      ? diff / add
      : diff / (2 - add);
    const h = Math.round(hue);
    const s = Math.round(sat * 100);
    const l = Math.round(lum * 100);
    if (this.model === "rgba") {
      return new Color(vector(h, s, l, this.vals.w), "hsla");
    }
    return new Color(v3(h, s, l), "hsl");
  }
  get color() {
    const a = this.vals.x;
    const b = this.vals.y;
    const c = this.vals.z;
    const model = this.model;
    if (model === "rgb") {
      return `rgb(${a},${b},${c})`;
    } else if (model === "hsl") {
      return `hsl(${a},${b}%,${c}%)`;
    } else if (model === "rgba") {
      const d = this.vals.w;
      return `rgba(${a},${b},${c},${d})`;
    } else if (model === "hsla") {
      const d = this.vals.w;
      return `hsla(${a},${b},${c},${d})`;
    } else {
      return "";
    }
  }
}

export const rgb = (
  red: number,
  green: number,
  blue: number,
  alpha?: number,
) => {
  const R = clamp(0, red, 255);
  const G = clamp(0, green, 255);
  const B = clamp(0, blue, 255);
  const [v, t]: [Vector, MODEL] = alpha !== undefined
    ? [vector(R, G, B, clamp(0, alpha, 1)), "rgba"]
    : [vector(R, G, B), "rgb"];
  return new Color(v, t);
};

export const hsl = (
  hue: number,
  saturation: number,
  lightness: number,
  alpha?: number,
) => {
  const H = clamp(0, hue, 360);
  const S = clamp(0, saturation, 100);
  const L = clamp(0, lightness, 100);
  const [v, t]: [Vector, MODEL] = alpha !== undefined
    ? [vector(H, S, L, clamp(0, alpha, 1)), "hsla"]
    : [vector(H, S, L), "hsl"];
  return new Color(v, t);
};

export const color = (colorName: keyof typeof colors) => {
  const c = colors[colorName];
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);
  if (result === null) return new Color(v3(0, 0, 0), "rgb");
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return new Color(v3(r, g, b), "rgb");
};
