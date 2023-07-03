import { ReactNode } from "react";
import css from '../styles/app.module.scss';

export const Tile = (
  { children, rows, cols }: { children: ReactNode; rows: number; cols: number },
) => {
  return (
    <div
      className={css.tile}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {children}
    </div>
  );
};
