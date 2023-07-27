import { MDXProvider } from "@mdx-js/react";
import { Children, ReactNode } from "react";
import base from "./styles/base.module.scss";
type Children = { children: ReactNode };

const HStack = ({ children }: Children) => {
  return (
    <div className={base.hstack}>
      {children}
    </div>
  );
};

const Right = ({ children }: Children) => {
  return (
    <div className={base.floatRight}>
      {children}
    </div>
  );
};

const Left = ({ children }: Children) => {
  return (
    <div className={base.floatLeft}>
      {children}
    </div>
  );
};

const FigCap = ({ children }: Children) => {
  return (
    <div className={base.figcap}>
      {children}
    </div>
  );
};

const Definition = ({ children }: Children) => {
  return (
    <dfn>
      {children}
    </dfn>
  );
};
const Ref = ({ children, id }: Children & { id: string }) => {
  return (
    <span id={id}>
      {children}
    </span>
  );
};

const components = {
  hstack: HStack,
  left: Left,
  right: Right,
  figcap: FigCap,
  definition: Definition,
  ref: Ref,
};

export const BaseComponents = ({ children }: Children) => {
  return (
    <MDXProvider components={components}>
      {children}
    </MDXProvider>
  );
};
