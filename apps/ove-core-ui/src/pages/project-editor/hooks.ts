import { type Rect, type Space } from "./types";
import { useEffect, useRef, useState } from "react";

export const useContainer = (space: Rect) => {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const ref = useRef<HTMLDivElement | null>(null);

  const update = (contentRect?: Rect) => {
    if (ref.current === null) return;
    const contentRect_ = contentRect ?? ref.current.getBoundingClientRect();
    const multiple = Math.min(contentRect_.width / space.width, contentRect_.height / space.height);
    setWidth(multiple * space.width);
    setHeight(multiple * space.height);
  };

  useEffect(update, [space.width, space.height]);

  return { width, height, ref, update };
};

export const useSpace = () => {
  const [rows, setRows] = useState(2);
  const [columns, setColumns] = useState(2);
  const [width, setWidth] = useState(3840);
  const [height, setHeight] = useState(2160);

  const update = (space: Space) => {
    setHeight(space.height || 4320);
    setWidth(space.width || 30720);
    setColumns(space.columns || 16);
    setRows(space.rows || 4);
  };

  return { rows, columns, width, height, update };
};