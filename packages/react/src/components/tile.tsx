import { ReactNode } from "react";

export const Tile = (
  { children, rows, cols }: { children: ReactNode; rows: number; cols: number },
) => {
  return (
    <div
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
