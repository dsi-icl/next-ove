import React, { type ReactNode, type RefObject } from "react";

type ResizeContainerProps = {
  children: ReactNode;
  canvas: {
    ref: RefObject<HTMLDivElement | null>;
    width: number | string;
    height: number | string;
    update: () => void;
  };
};

const ResizeContainer = ({ children, canvas }: ResizeContainerProps) => (
  <div
    className="m-1 flex h-[calc(100%-2.5rem)] w-[calc(100%-0.5rem)] items-center justify-center"
    ref={canvas.ref}
  >
    <div
      style={{
        width: canvas.width,
        height: canvas.height,
      }}
    >
      {children}
    </div>
  </div>
);

export default ResizeContainer;
