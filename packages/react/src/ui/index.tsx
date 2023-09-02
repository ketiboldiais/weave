import { CSSProperties, useRef, useState } from "react";
const getPercentage = (current: number, max: number) => (100 * current) / max;

const getLeft = (percentage: number) => `calc(${percentage}% - 5px)`;

const getValue = (percentage: number, max: number) => (max / 100) * percentage;

type SliderAPI = {
  initial?: number;
  max?: number;
  minLabel?: number;
  maxLabel?: number;
  onChange?: (newValue: number) => void;
};

export const Slider = ({
  initial = 0,
  max = 100,
  onChange = () => {},
  minLabel = initial,
  maxLabel = max,
}: SliderAPI) => {
  const initialPercentage = getPercentage(initial, max);
  const [current, setCurrent] = useState(initial);
  let boxStyles: CSSProperties = {
    position: "relative",
    borderRadius: "3px",
    background: "#ddd",
    height: "2px",
  };
  const thumbStyles: CSSProperties = {
    width: "15px",
    height: "15px",
    borderRadius: "50%",
    position: "relative",
    top: "-6px",
    background: "white",
    cursor: "pointer",
  };
  const labelStyle: CSSProperties = {
    position: "relative",
    top: "25px",
    textAlign: "center",
    fontSize: "12px",
  };
  const headerStyles: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    position: "relative",
    bottom: "10px",
  };
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const diff = useRef(0);
  const onMove = (event: PointerEvent) => {
    event.preventDefault();
    if (sliderRef.current && thumbRef.current) {
      let newx = event.clientX -
        diff.current -
        sliderRef.current.getBoundingClientRect().left;
      const end = sliderRef.current.offsetWidth - thumbRef.current.offsetWidth;
      const start = 0;
      if (newx < start) {
        newx = 0;
      }
      if (newx > end) {
        newx = end;
      }
      const newpercentage = getPercentage(newx, end);
      const newvalue = getValue(newpercentage, max);
      thumbRef.current.style.left = getLeft(newpercentage);
      setCurrent(newvalue);
      onChange(newvalue);
    }
  };
  const onUp = () => {
    document.removeEventListener("pointerup", onUp);
    document.removeEventListener("pointermove", onMove);
  };
  const onDown = (event: PointerEvent) => {
    event.preventDefault();
    if (thumbRef.current) {
      diff.current = event.clientX -
        thumbRef.current.getBoundingClientRect().left;
    }
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };
  return (
    <div style={{ margin: "0 62px" }}>
      <div style={headerStyles}>
        <div>{minLabel}</div>
        <div>{maxLabel}</div>
      </div>
      <div ref={sliderRef} style={boxStyles}>
        <div
          ref={thumbRef}
          style={{ ...thumbStyles, left: getLeft(initialPercentage) }}
          onPointerDown={onDown as any}
        >
          <div style={labelStyle}>
            {current.toPrecision(4)}
          </div>
        </div>
      </div>
    </div>
  );
};
