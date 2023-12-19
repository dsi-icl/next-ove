import {
  type Invite,
  type Project,
  type Section,
  type User
} from "@prisma/client";
import { nanoid } from "nanoid";
import { useStore } from "../../store";
import { useDialog } from "@ove/ui-components";
import { type Rect, type Space } from "./types";
import { type ProjectMetadata } from "./metadata/metadata";
import { useCallback, useEffect, useRef, useState } from "react";

export const useContainer = (space: Space) => {
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

  const cells = Array.from({ length: space.rows }, (_x, row) => Array.from({ length: space.columns }, (_y, col) => ({
    x: (width / space.columns) * col,
    y: (height / space.rows) * row,
    width: space.width / space.columns,
    height: space.height / space.rows
  }))).flat();

  return { width, height, ref, update, cells };
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

export const useSections = (projectId: string) => {
  const [sections_, setSections_] = useState(order([]));
  const [selected, setSelected] = useState<string | null>(null);
  const setConfig = useStore(state => state.setConfig);
  const setSections = (handler: (cur: Section[]) => Section[]) => setSections_(cur => order(handler(cur)));

  useEffect(() => {
    if (selected === null) {
      setConfig("{}");
    } else {
      const config = sections_.find(({ id }) => id === selected)!.config;
      setConfig(config === null ? "{}" : JSON.stringify(config));
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
      const newSectionId = selected ?? nanoid(16);
      const newSections = cur.filter(({ id }) => id !== selected).concat([{
        ...section,
        ordering: cur.length,
        id: newSectionId
      }]);
      return reorder(newSectionId, parseInt(section.ordering.toString()), newSections);
    });
    setSelected(null);
  };

  const dragSection = (id: string, x: number, y: number) => {
    setSections(cur => cur.map(section => section.id === id ? {
      ...section,
      x,
      y
    } : section));
  };

  const removeState = (state: string) => {
    setSections(cur => cur.map(section => {
      if (!section.states.includes(state)) return section;
      if (section.states.length === 1) return undefined;
      return {
        ...section,
        states: section.states.filter(s => s !== state)
      };
    }).filter(Boolean) as Section[]);
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
      let newSections = cur.map(section => {
        if (section.id !== id) return section;
        if (section.states.length === 1) return undefined;
        return {
          ...section,
          states: section.states.filter(s => s !== state)
        };
      }).filter(Boolean) as Section[];

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
    all: sections_,
    getSections: (state: string) => sections_.filter(({ states }) => states.includes(state)),
    getSectionsToImport: (from: string, to: string) => sections_.filter(({ states }) => states.includes(from) && !states.includes(to)),
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
  | "controller"
  | "env"
  | "live"

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
      setSelected(name);
    },
    addState: () => {
      let newState: string | null = null;
      setCustomStates(cur => {
        newState = `__new__${cur.length}`;
        return [...cur, newState];
      });
      setTimeout(() => {
        if (newState === null) return;
        setSelected(newState);
      }, 200);
    },
    format: (state: string) => {
      if (state === "__default__") return "*";
      if (state.startsWith("__new__")) return `New (${state.slice(7)})`;
      return state;
    },
    select,
    selected
  };
};

export const useProject = (projectId: string) => {
  const tags: string[] = [];
  const [project, setProject] = useState<Project>({});

  const updateProject = (project: ProjectMetadata) => {
    setProject(cur => ({ ...cur, ...project }));
  };

  return {
    project,
    updateProject,
    tags
  };
};

export type File = { name: string, version: number, assetId: string }

export const useFiles = () => {
  const globals: File[] = [];
  const [files, setFiles] = useState<File[]>([]);
  const [data, setData] = useState<{
    [key: `${string}/${string}`]: string
  }>({});

  const addFile = (name: string, data: string, assetId?: string) => {
    if (globals.find(file => file.name === name) !== undefined) return null; // TODO: add snackbar failure message
    if (assetId === undefined) {
      assetId = nanoid(16);
      setFiles(cur => [...cur, {
        name: name,
        version: 1,
        assetId: assetId!
      }]);
      setData(cur => ({ ...cur, [`${name}/1`]: data }));
    } else {
      let latest: File | null = null;
      setFiles(cur => {
        latest = getLatest(assetId!);
        setData(cur => ({
          ...cur,
          [`${name}/${latest!.version + 1}`]: data
        }));
        return [...cur, { ...latest, version: latest.version + 1 }];
      });
    }

    return { assetId, name };
  };

  const generateThumbnail = () => addFile(`thumbnail-gen-${nanoid(2)}`, "thumbnail data"); // TODO: replace with real thumbnail generation

  const getLatest = useCallback((id: string) => {
    const latest = Math.max(...files.filter(file => file.assetId === id || file.name === id).map(({ version }) => version));
    return files.find(file => (file.assetId === id || file.name === id) && file.version === latest)!;
  }, [files]);

  const getData = (file: File) => data[`${file.name}/${file.version}`];

  const toURL = (name: string, version: number) => `/s3/${name}/${version}`;
  const fromURL = (url: string | null) => {
    if (url === null || !url.startsWith("/s3/")) return null;
    const sections = url.split("/");
    return files.find(({
      name,
      version
    }) => name === sections.at(-2)! && version === parseInt(sections.at(-1)!)) ?? null;
  };

  return {
    assets: files.filter(({ name }) => !["control", "env"].includes(name)),
    addFile,
    toURL,
    fromURL,
    data,
    getLatest,
    getData,
    generateThumbnail
  };
};

export const useCollaboration = (project: Project, username: string) => {
  const [users] = useState<User[]>([
    {
      username: "me",
      id: "me",
      email: null,
      password: "",
      role: "creator",
      projectIds: [project.id]
    },
    {
      username: "you",
      id: "you",
      email: null,
      password: "",
      role: "creator",
      projectIds: [project.id]
    },
    {
      username: "them",
      id: "them",
      email: null,
      password: "",
      role: "creator",
      projectIds: [project.id]
    },
    {
      username: "other",
      id: "other",
      email: null,
      password: "",
      role: "creator",
      projectIds: [project.id]
    }
  ]);
  const [invites, setInvites] = useState<Invite[]>([
    {
      id: nanoid(),
      senderId: "me",
      recipientId: "you",
      status: "accepted",
      sent: new Date(),
      projectId: project.id
    },
    {
      id: nanoid(),
      senderId: "me",
      recipientId: "other",
      status: "pending",
      sent: new Date(),
      projectId: project.id
    }
  ]);

  const uninvited = users.filter(user => project.collaboratorIds.find(id => id === user.id) === undefined && invites.find(({
    recipientId,
    status
  }) => recipientId === user.id && status === "pending") === undefined);
  const accepted = project.collaboratorIds.map(id => users.find(user => user.id === id)!);
  const invited = invites.filter(({ status }) => status === "pending").map(({ recipientId }) => users.find(({ id }) => id === recipientId)!);

  const inviteCollaborator = (id: string) => {
    setInvites(cur => [...cur, {
      id: nanoid(16),
      sent: new Date(),
      status: "pending",
      projectId: project.id,
      senderId: username,
      recipientId: id
    }]);
  };

  const removeCollaborator = (id: string) => {
    if (id === project.creatorId) return;
    const user = users.find(user => user.id === id)!;
    if (user.id === users.find(({ id }) => id === project.creatorId)!.username) return;
    setInvites(cur => cur.filter(x => x.recipientId !== id && x.status !== "declined"));
  };

  return {
    accepted,
    invited,
    uninvited,
    invites,
    inviteCollaborator,
    removeCollaborator
  };
};
