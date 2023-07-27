import { ReactNode, useRef, useState } from "react";
import appCss from "../styles/app.module.scss";
import { Fader } from "./Fader";
import { useOutClick } from "../hooks/useOutClick";

export const Codeblock = ({ children }: { children: ReactNode }) => {
  const [show, setShow] = useState(false);
  const divref = useRef<HTMLDivElement>(null);
  const clickout = () => setShow(false);
  useOutClick(divref, clickout);
  return (
    <div ref={divref}>
      <div>
        <button className={appCss.underline} onClick={() => setShow(!show)}>
          Code
        </button>
      </div>
      <Fader show={show} duration={300}>
        <div>
          {children}
        </div>
      </Fader>
    </div>
  );
};
