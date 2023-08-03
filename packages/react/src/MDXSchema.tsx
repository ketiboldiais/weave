import { MDXProvider } from "@mdx-js/react";
import { Children, CSSProperties, HTMLAttributes, ReactNode } from "react";
import base from "./styles/base.module.scss";
type Children = { children: ReactNode };

type BoxProps = {
  display: string;
};

const Note = (props: Children) => {
  return (
    <div className={`note`}>
      {props.children}
    </div>
  );
};

const HStack = (props: Children & CSSProperties) => {
  const { children, ...rest } = props;
  return (
    <div
      className={`hstack`}
      style={{ ...rest }}
    >
      {props.children}
    </div>
  );
};

const P1 = ({ children }: Children) => {
  return (
    <div className={base.p1}>
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
const Tbl = ({ children }: Children) => {
  return (
    <div className={base.tbl}>
      {children}
    </div>
  );
};

const Link = (
  props: HTMLAttributes<HTMLAnchorElement> & { children?: ReactNode },
) => {
  const { children, ...rest } = props;
  return <a {...rest} target={"_blank"}>{children}</a>;
};

const Grid = ({children}:Children) => {
  return (
    <div className={`grid`}>
      {children}
    </div>
  )
}

const components = {
  grid: Grid,
  left: Left,
  right: Right,
  figcap: FigCap,
  definition: Definition,
  ref: Ref,
  p1: P1,
  tbl: Tbl,
  hstack: HStack,
  note: Note,
  a: Link,
};

export const BaseComponents = ({ children }: Children) => {
  return (
    <MDXProvider components={components}>
      {children}
    </MDXProvider>
  );
};
