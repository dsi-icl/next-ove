import {
  type Invite,
  type Project,
  type Section,
  type User
} from "@prisma/client";
import "@total-typescript/ts-reset";
import { nanoid } from "nanoid";
import { trpc } from "../../utils/api";
import { useStore } from "../../store";
import { assert } from "@ove/ove-utils";
import { useDialog } from "@ove/ui-components";
import { type Rect, type Space } from "./types";
import { type ProjectMetadata } from "./metadata/metadata";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isError, type File } from "@ove/ove-types";
import { logger } from "../../env";
import { toast } from "sonner";

export const useContainer = (space: Space) => {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const ref = useRef<HTMLDivElement | null>(null);

  const update = useCallback((contentRect?: Rect) => {
    if (ref.current === null) return;
    const contentRect_ = contentRect ?? ref.current.getBoundingClientRect();
    const multiple = Math.min(
      contentRect_.width / space.width,
      contentRect_.height / space.height
    );
    setWidth(multiple * space.width);
    setHeight(multiple * space.height);
  }, [space.width, space.height]);

  useEffect(update, [space.width, space.height, update]);

  return { width, height, ref, update };
};

export const useSpace = () => {
  const [rows, setRows] = useState(2);
  const [columns, setColumns] = useState(2);
  const [width, setWidth] = useState(16);
  const [height, setHeight] = useState(9);

  const update = (space: Space) => {
    setHeight(space.height || 4);
    setWidth(space.width || 64);
    setColumns(space.columns || 16);
    setRows(space.rows || 4);
  };

  const cells = Array.from(
    { length: rows },
    (_x, row) =>
      Array.from({ length: columns }, (_y, col) => ({
        x: (width / columns) * col,
        y: (height / rows) * row,
        width: width / columns,
        height: height / rows
      }))).flat();

  return { rows, columns, width, height, update, cells };
};

const order = (sections: Section[]) =>
  [...sections.sort((a, b) => a.ordering - b.ordering)];

export const useSections = (projectId: string, initialSections: Section[]) => {
  const [sections_, setSections_] = useState(order(initialSections));
  const [selected, setSelected] = useState<string | null>(null);
  const setConfig = useStore(state => state.setConfig);
  const setSections = (handler: (cur: Section[]) => Section[]) =>
    setSections_(cur => order(handler(cur)));

  useEffect(() => {
    if (selected === null) {
      setConfig("{}");
    } else {
      const config = assert(sections_.find(({ id }) => id === selected)).config;
      setConfig(config === null ? "{}" : JSON.stringify(config));
    }
  }, [selected, sections_, setConfig]);

  // GET IT – NEW ORDER/BLUE MONDAY. I'M SO FUNNY.
  const reorder = (id: string, blueMonday: number, sections: Section[]) => {
    const section = assert(sections.find(section => section.id === id));
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
      return reorder(newSectionId,
        parseInt(section.ordering.toString()), newSections);
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
    setSections(cur =>
      cur.map(section =>
        !section.states.includes(state) ? section : {
          ...section,
          states: section.states.map(c => c === state ? name : c)
        }));
  };

  const addToState = (id: string, state: string) => {
    setSections(cur =>
      cur.map(section =>
        section.id !== id || section.states.includes(state) ? section : {
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
    getSections: (state: string) => sections_
      .filter(({ states }) => states.includes(state)),
    getSectionsToImport: (from: string, to: string) =>
      sections_.filter(({ states }) =>
        states.includes(from) && !states.includes(to)),
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
    states: sections_
      .flatMap(({ states }) => states)
      .filter((x, i, arr) => arr.indexOf(x) === i)
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
  }, [action, closeDialog, openDialog]);

  return { dialog: ref, setAction, action, isOpen };
};

export const useCustomStates = (
  initialStates: string[],
  selectSection: (selected: string | null) => void,
  updateStateForSections: (state: string, name: string) => void,
  removeStateFromSection: (state: string) => void
) => {
  const [customStates, setCustomStates] = useState(["__default__"]);
  const [selected, setSelected] = useState("__default__");

  const select = (state: string) => {
    selectSection(null);
    setSelected(state);
  };

  return {
    states: customStates
      .slice(0, 1)
      .concat(initialStates)
      .concat(customStates.slice(1))
      .filter((x, i, arr) => arr.indexOf(x) === i),
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

const loadNewProject = (username: string): (Project & {
  layout: Section[]
}) | null => ({
  id: nanoid(),
  title: "",
  description: "",
  notes: "",
  publications: [],
  tags: [],
  presenterNotes: "",
  creatorId: username,
  collaboratorIds: [username],
  thumbnail: null,
  layout: [],
  created: new Date(),
  updated: new Date(),
  isPublic: false
});

export const useSave = () => {
  const saveProject = trpc.projects.saveProject.useMutation({
    retry: false
  });

  return {
    saveProject: (project: Project, layout: Section[]) => {
      saveProject.mutateAsync({
        ...project,
        layout
      }).then(() => toast.info("Successfully saved project!")).catch(e => {
        logger.error(e);
        toast.error("Error saving project");
      });
    }
  };
};

export const useProject = (
  username: string | null,
  projectId: string | null
) => {
  const tags_ = trpc.projects.getTags.useQuery();
  const project_ = trpc.projects.getProject.useQuery(
    { projectId: projectId ?? "__ERROR__" },
    { enabled: projectId !== null }
  );

  const [project, setProject] = useState<(Project & {
    layout: Section[]
  }) | null>(null);
  const tags = useMemo(() => (tags_.status === "success" &&
  !isError(tags_.data) ? tags_.data : []).concat(project?.tags ?? [])
    .filter((x, i, arr) =>
      arr.indexOf(x) === i), [tags_.data, tags_.status, project?.tags]);

  useEffect(() => {
    if (project_.status !== "success" || project_.data === null ||
      isError(project_.data)) return;
    setProject(project_.data);
  }, [project_.status, project_.data]);

  useEffect(() => {
    if (username === null || projectId !== null) return;
    setProject(loadNewProject(username));
  }, [username, projectId]);

  const updateProject = (project: ProjectMetadata) => {
    setProject(cur => cur === null ? null : ({ ...cur, ...project }));
  };

  return {
    project,
    tags,
    updateProject
  };
};

export const useFiles = (projectId: string) => {
  const files_ = trpc.projects.getFiles.useQuery({ projectId });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (files_.status !== "success" || isError(files_.data)) return;
    setFiles(files_.data);
  }, [files_.status, files_.data]);

  const addFile = (name: string, data: string, assetId?: string) => {
    if (files.find(file =>
      file.name === name && file.isGlobal) !== undefined) {
      return null; // TODO: add snackbar failure message
    }
    if (assetId === undefined) {
      assetId = nanoid(16);
      setFiles(cur => [...cur, {
        name: name,
        version: 1,
        assetId: assert(assetId),
        isGlobal: false
      }]);
      // setData(cur => ({ ...cur, [`${name}/1`]: data }));
    } else {
      let latest: File | null = null;
      setFiles(cur => {
        latest = getLatest(assert(assetId));
        // setData(cur => ({
        //   ...cur,
        //   [`${name}/${latest!.version + 1}`]: data
        // }));
        return [...cur, { ...latest, version: latest.version + 1 }];
      });
    }

    return { assetId, name };
  };

  const generateThumbnail = () => addFile(
    `thumbnail-gen-${nanoid(2)}`, "thumbnail data"
  ); // TODO: replace with real thumbnail generation

  const getLatest = useCallback((id: string) => {
    const latest = Math.max(...files.filter(file =>
      file.assetId === id || file.name === id).map(({ version }) => version));
    return assert(files.find(file =>
      (file.assetId === id || file.name === id) && file.version === latest));
  }, [files]);

  const getData = async (file: File) => ""; // TODO: replace with server call

  const toURL = (name: string, version: number) => `/s3/${name}/${version}`;
  const fromURL = (url: string | null) => {
    if (url === null || !url.startsWith("/s3/")) return null;
    const sections = url.split("/");
    return files.find(({
      name,
      version
    }) => name === assert(sections.at(-2)) &&
      version === parseInt(assert(sections.at(-1)))) ?? null;
  };

  return {
    assets: files.filter(({ name }) => !["control", "env"].includes(name)),
    addFile,
    toURL,
    fromURL,
    getLatest,
    getData,
    generateThumbnail
  };
};

export const useCollaboration = (project: Project, username: string) => {
  const users_ = trpc.projects.getUsers.useQuery();
  const invites_ = trpc.projects.getInvitesForProject
    .useQuery({ projectId: project.id });
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);

  useEffect(() => {
    if (users_.status !== "success" || isError(users_.data)) return;
    setUsers(users_.data);
  }, [users_.status, users_.data]);

  useEffect(() => {
    if (invites_.status !== "success" || isError(invites_.data)) return;
    setInvites(invites_.data);
  }, [invites_.status, invites_.data]);

  const uninvited = users
    .filter(user => (project.collaboratorIds.concat([project.creatorId]))
      .find(id => id === user.id) === undefined && invites.find(({
      recipientId,
      status
    }) => recipientId === user.id && status === "pending") === undefined);
  const accepted = project.collaboratorIds
    .map(id => users.find(user => user.id === id))
    .filter(Boolean).concat(users.filter(user => user.id === project.creatorId));
  const invited = invites
    .filter(({ status }) => status === "pending")
    .map(({ recipientId }) => users.find(({ id }) =>
      id === recipientId)).filter(Boolean);

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
    const user = assert(users.find(user => user.id === id));
    if (user.id === assert(users.find(({ id }) =>
      id === project.creatorId)).username) return;
    setInvites(cur => cur.filter(x =>
      x.recipientId !== id && x.status !== "declined"));
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

export const useObservatories = () => {
  const observatories_ = trpc.core.getObservatoryBounds.useQuery();
  const [observatories, setObservatories] = useState<Record<string, {
    width: number,
    height: number,
    rows: number,
    columns: number
  }>>({});

  useEffect(() => {
    if (observatories_.status !== "success" ||
      isError(observatories_.data)) return;
    setObservatories(observatories_.data);
  }, [observatories_.status, observatories_.data]);

  return { observatories };
};
