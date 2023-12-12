import { type Section } from "@prisma/client";
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

const order = (sections: Section[]) => [...sections.sort((a, b) => a.ordering - b.ordering)];

export const useSections = (state: string, sections_: Section[]) => {
  const [sections, setSections_] = useState(order(sections_));
  const [selected, setSelected] = useState<string | null>(null);
  const setSections = (handler: (cur: Section[]) => Section[]) => setSections_(cur => order(handler(cur)));

  // GET IT – NEW ORDER/BLUE MONDAY. I'M SO FUNNY.
  const reorder = (id: string, blueMonday: number) => {
    setSections(cur => {
      const section = cur.find(section => section.id === id)!;
      const removed = cur.filter(section => section.id !== id);
      return [
        ...removed.slice(0, blueMonday).map((x, i) => ({ ...x, ordering: i })),
        { ...section, ordering: blueMonday },
        ...removed.slice(blueMonday).map((x, i) => ({ ...x, ordering: i + 1 }))
      ];
    });
  };

  const dragSection = (id: string, x: number, y: number) => {
    setSections(cur => cur.map(section => section.id === id ? {
      ...section,
      x,
      y
    } : section));
  };

  return {
    sections: sections.filter(({ states }) => states.includes(state)),
    dragSection,
    reorder,
    select: setSelected,
    selected
  };
};

export const useProjectState = () => {
  const [state, setState] = useState("__default__");

  return { state, setState };
};