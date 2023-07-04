import { ReactNode, useRef, useState } from "react";
import css from "../styles/codeblock.module.scss";
import appCss from "../styles/app.module.scss";
import { Fader } from "./Fader";
import { useOutClick } from "../hooks/useOutClick";

export const Codeblock = ({ children }: { children: ReactNode }) => {
  const [show, setShow] = useState(false);
  const divref = useRef<HTMLDivElement>(null);
  const clickout = () => setShow(false);
  useOutClick(divref, clickout);
  return (
    <div className={css.codeblock} ref={divref}>
      <div className={css.btn}>
        <button className={appCss.underline} onClick={() => setShow(!show)}>
          Code
        </button>
      </div>
      <Fader show={show} duration={300}>
        <div className={css.snippet}>
          {children}
        </div>
      </Fader>
    </div>
  );
};
