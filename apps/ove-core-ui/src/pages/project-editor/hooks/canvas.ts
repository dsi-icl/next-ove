import { useObservatory } from "../../../hooks/observatories";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const useCanvas = () => {
  const {bounds} = useObservatory();
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const ref = useRef<HTMLDivElement | null>(null);

  const update = useCallback(() => {
    if (ref.current === null || bounds === null) return;
    const contentRect_ = ref.current.getBoundingClientRect();
    const multiple = Math.min(
      contentRect_.width / bounds.width,
      contentRect_.height / bounds.height
    );
    setWidth(multiple * bounds.width);
    setHeight(multiple * bounds.height);
  }, [bounds]);

  useEffect(() => {
    const observer = new ResizeObserver(update);

    if (ref.current === null) return;
    observer.observe(ref.current);

    return () => {
      if (ref.current === null) return;
      observer.unobserve(ref.current);
    };
  }, [update]);

  useEffect(update, [bounds?.width, bounds?.height, update]);

  return { width, height, ref, update };
};

export const useCells = () => {
  const {bounds} = useObservatory();
  return useMemo(() => bounds === null ? null : Array.from(
    { length: bounds.rows },
    (_x, row) =>
      Array.from({ length: bounds.columns }, (_y, col) => ({
        x: (bounds.width / bounds.columns) * col,
        y: (bounds.height / bounds.rows) * row,
        width: bounds.width / bounds.columns,
        height: bounds.height / bounds.rows
      }))).flat(), [bounds]);
};