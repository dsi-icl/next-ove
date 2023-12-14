import { nanoid } from "nanoid";
import { Project, type Section } from "@prisma/client";
import { useDialog } from "@ove/ui-components";
import { type Rect, type Space } from "./types";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store";
import { type ProjectMetadata } from "./metadata/metadata";

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

  const cells = Array.from({ length: rows }, (_x, row) => Array.from({ length: columns }, (_y, col) => ({
    x: (width / columns) * col,
    y: (height / rows) * row,
    width: width / columns,
    height: height / rows
  }))).flat();

  return { rows, columns, width, height, update, cells };
};

const order = (sections: Section[]) => [...sections.sort((a, b) => a.ordering - b.ordering)];

export const useSections = (sections: Section[], projectId: string) => {
  const [sections_, setSections_] = useState(order(sections));
  const [selected, setSelected] = useState<string | null>(null);
  const setConfig = useStore(state => state.setConfig);
  const setSections = (handler: (cur: Section[]) => Section[]) => setSections_(cur => order(handler(cur)));

  useEffect(() => {
    if (selected === null) {
      setConfig("");
    } else {
      const config = sections_.find(({ id }) => id === selected)!.config;
      setConfig(config === null ? "" : JSON.stringify(config));
    }
  }, [selected, sections_]);

  // GET IT – NEW ORDER/BLUE MONDAY. I'M SO FUNNY.
  const reorder = (id: string, blueMonday: number, sections: Section[]) => {
    const section = sections.find(section => section.id === id)!;
    const removed = sections.filter(section => section.id !== id);
    return [
      ...removed.slice(0, blueMonday).map((x, i) => ({ ...x, ordering: i })),
      { ...section, ordering: blueMonday },
      ...removed.slice(blueMonday).map((x, i) => ({
        ...x,
        ordering: i + 1 + blueMonday
      }))
    ];
  };

  const updateSection = (section: Omit<Section, "id">) => {
    setSections(cur => {
      const newSectionId = selected === null ? nanoid(16) : selected;
      const newSections = cur.filter(({ id }) => id !== selected).concat([{
        ...section,
        ordering: cur.length,
        id: newSectionId
      }]);
      return reorder(newSectionId, parseInt(section.ordering.toString()), newSections);
    });
  };

  const dragSection = (id: string, x: number, y: number) => {
    setSections(cur => cur.map(section => section.id === id ? {
      ...section,
      x,
      y
    } : section));
  };

  const removeState = (state: string) => {
    setSections(cur => cur.map(section => !section.states.includes(state) ? section : (section.states.length === 1 ? undefined : {
      ...section,
      states: section.states.filter(s => s !== state)
    })).filter(Boolean) as Section[]);
  };

  const updateState = (state: string, name: string) => {
    setSections(cur => cur.map(section => !section.states.includes(state) ? section : {
      ...section,
      states: section.states.map(c => c === state ? name : c)
    }));
  };

  const addToState = (id: string, state: string) => {
    setSections(cur => cur.map(section => section.id !== id || section.states.includes(state) ? section : {
      ...section,
      states: section.states.concat([state])
    }));
  };

  const removeFromState = (id: string, state: string) => {
    if (id === selected) {
      setSelected(null);
    }
    setSections(cur => {
      let newSections = cur.map(section => section.id !== id ? section : (section.states.length === 1 ? undefined : {
        ...section,
        states: section.states.filter(s => s !== state)
      })).filter(Boolean) as Section[];

      if (newSections.length !== cur.length) {
        newSections = newSections.map((section, i) => ({
          ...section,
          ordering: i
        }));
      }

      return newSections;
    });
  };

  const generateSection = (state: string) => {
    const newSectionId = nanoid(16);
    setSections(cur => [...cur].concat([{
      id: newSectionId,
      x: 0,
      y: 0,
      width: 0.25,
      height: 0.25,
      ordering: cur.length,
      asset: "",
      assetId: null,
      config: null,
      dataType: "html",
      projectId: projectId,
      states: [state]
    }]));
    setSelected(newSectionId);
  };

  return {
    getSections: (state: string) => sections_.filter(({ states }) => states.includes(state)),
    setSections,
    dragSection,
    reorder,
    select: setSelected,
    selected,
    removeState,
    updateState,
    addToState,
    removeFromState,
    generateSection,
    updateSection,
    states: sections_.flatMap(({ states }) => states).filter((x, i, arr) => arr.indexOf(x) === i)
  };
};

export type Actions =
  "metadata"
  | "import-section"
  | "custom-config"
  | "launch"
  | "upload"
  | "preview"
  | "controller"

export const useActions = () => {
  const [action, setAction] = useState<Actions | null>(null);
  const { openDialog, isOpen, closeDialog, ref } = useDialog();

  useEffect(() => {
    if (action === null) {
      closeDialog();
    } else {
      openDialog();
    }
  }, [action]);

  return { dialog: ref, setAction, action, isOpen };
};

export const useCustomStates = (initialStates: string[], selectSection: (selected: string | null) => void, updateStateForSections: (state: string, name: string) => void, removeStateFromSection: (state: string) => void) => {
  const [customStates, setCustomStates] = useState(["__default__"]);
  const [selected, setSelected] = useState("__default__");

  const select = (state: string) => {
    selectSection(null);
    setSelected(state);
  };

  return {
    states: customStates.slice(0, 1).concat(initialStates).concat(customStates.slice(1)).filter((x, i, arr) => arr.indexOf(x) === i),
    removeState: (state: string) => {
      setCustomStates(cur => cur.filter(c => c !== state));
      removeStateFromSection(state);
      select("__default__");
    },
    updateState: (state: string, name: string) => {
      setCustomStates(cur => cur.map(c => c === state ? name : c));
      updateStateForSections(state, name);
    },
    addState: () => {
      setCustomStates(cur => [...cur, `__new__${cur.length}`]);
    },
    format: (state: string) => state === "__default__" ? "*" : (state.startsWith("__new__") ? `New (${state.slice(7)})` : state),
    select,
    selected
  };
};

export const useProject = (project_: Project) => {
  const [project, setProject] = useState(project_);

  const updateProject = (project: ProjectMetadata) => {
    setProject(cur => ({ ...cur, ...project }));
  };

  return { project, updateProject };
};