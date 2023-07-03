import { Fragment, ReactNode, useEffect, useRef, useState } from "react";

type OpacityData = { opacity: number };
type FadeboxProps = {
  show: boolean;
  children: ReactNode;
  duration?: number;
  from?: OpacityData;
  to?: OpacityData;
  fill?: "auto" | "backwards" | "both" | "forwards" | "none";
  unMountAnimation?: Keyframe[];
};

export const Fader = ({
  show,
  children,
  from = { opacity: 0 },
  to = { opacity: 1 },
  duration = 500,
  fill = "forwards",
  unMountAnimation = [to, from],
}: FadeboxProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [removeState, setRemove] = useState(!show);
  const options = { duration, fill };
  useEffect(() => {
    const childElement = elementRef.current;
    if (show) {
      setRemove(false);
      if (!childElement) return;
      childElement.animate([from, to], options);
    } else {
      if (!childElement) return;
      const animation = childElement.animate(
        unMountAnimation,
        options,
      );
      animation.onfinish = () => {
        setRemove(true);
      };
    }
  }, [show, removeState]);
  if (removeState) return null;
  return (
    <div ref={elementRef}>
      {children}
    </div>
  );
};
