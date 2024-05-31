import {
  DataType,
  dataTypes,
  type File as TFile,
  isError
} from "@ove/ove-types";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { trpc } from "../../utils/api";
import { env, logger } from "../../env";
import type { Rect, Space } from "./types";
import { assert, Json } from "@ove/ove-utils";
import type { ProjectMetadata } from "./metadata/metadata";
import type { Invite, Project, Section, User } from "@prisma/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import "@total-typescript/ts-reset";

export const useContainer = (space: Space | null) => {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const ref = useRef<HTMLDivElement | null>(null);

  const update = useCallback((contentRect?: Rect) => {
    if (ref.current === null || space === null) return;
    const contentRect_ = contentRect ?? ref.current.getBoundingClientRect();
    const multiple = Math.min(
      contentRect_.width / space.width,
      contentRect_.height / space.height
    );
    setWidth(multiple * space.width);
    setHeight(multiple * space.height);
  }, [space]);

  useEffect(update, [space?.width, space?.height, update]);

  return { width, height, ref, update };
};

export const useSpace = (observatories: Record<string, Rect & {
  rows: number,
  columns: number
}>) => {
  const observatory = useMemo(() =>
    Object.entries(observatories).at(0) ?? null, [observatories]);
  const [name, setName] = useState<string | null>(observatory?.[0] ?? null);
  const [space, setSpace] = useState<{
    width: number,
    height: number,
    rows: number,
    columns: number
  } | null>(observatory?.[1] ?? null);

  useEffect(() => {
    if (name !== null || space !== null) return;
    setName(observatory?.[0] ?? null);
    setSpace(observatory?.[1] ?? null);
  }, [observatory]);

  useEffect(() => {
    if (name === null || Object.keys(observatories).includes(name)) return;
    setName(null);
    setSpace(null);
  }, [observatories, name, setName, setSpace]);

  const cells = useMemo(() => space === null ? null : Array.from(
    { length: space.rows },
    (_x, row) =>
      Array.from({ length: space.columns }, (_y, col) => ({
        x: (space.width / space.columns) * col,
        y: (space.height / space.rows) * row,
        width: space.width / space.columns,
        height: space.height / space.rows
      }))).flat(), [space]);

  const update = useCallback((preset: string) => {
    if (!Object.keys(observatories).includes(preset)) return;
    setName(preset);
    setSpace(observatories[preset]);
  }, [observatories, setName, setSpace]);

  return { space, update, cells, name };
};

const order = (sections: Section[]) =>
  [...sections.sort((a, b) => a.ordering - b.ordering)];

export const useSections = (projectId: string) => {
  const [sections_, setSections_] = useState<Section[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const getSections = trpc.projects.getSectionsForProject.useQuery(
    { projectId },
    {
      retry: false,
      refetchInterval: false
    }
  );

  useEffect(() => {
    if (getSections.status !== "success") return;
    if (isError(getSections.data)) return;
    setSections_(order(getSections.data));
  }, [getSections.status, getSections.data, setSections_]);

  const setSections = (handler: (cur: Section[]) => Section[]) =>
    setSections_(cur => order(handler(cur)));

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
      const newSectionId = selected ?? nanoid(32);
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
    const filter = (section: Section) =>
      section.states.filter(s => s !== state);
    setSections(cur => cur.map(section => {
      if (!section.states.includes(state)) return section;
      if (section.states.length === 1) return undefined;
      return {
        ...section,
        states: filter(section)
      };
    }).filter(Boolean));
  };

  const updateState = (state: string, name: string) => {
    const map = (section: Section) =>
      section.states.map(c => c === state ? name : c);
    setSections(cur =>
      cur.map(section =>
        !section.states.includes(state) ? section : {
          ...section,
          states: map(section)
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
    const filter = (section: Section) =>
      section.states.filter(s => s !== state);
    setSections(cur => {
      let newSections = cur.map(section => {
        if (section.id !== id) return section;
        if (section.states.length === 1) return undefined;
        return {
          ...section,
          states: filter(section)
        };
      }).filter(Boolean);

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
    const newSectionId = nanoid(32);
    setSections(cur => [...cur].concat([{
      id: newSectionId,
      x: 0,
      y: 0,
      width: 0.25,
      height: 0.25,
      ordering: cur.length,
      asset: "",
      assetId: null,
      dataType: "html",
      projectId,
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

export type LaunchConfig = {
  projectId: string
  observatory: string
  layout: Section[] | null
}

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

const loadNewProject = (username: string): Project | null => ({
  id: nanoid(32),
  title: "",
  description: "",
  notes: "",
  publications: [],
  tags: [],
  presenterNotes: "",
  creatorId: username,
  collaboratorIds: [username],
  thumbnail: null,
  created: new Date(),
  updated: new Date(),
  isPublic: false
});

export const useSave = (updateProject: (project: Project) => void) => {
  const saveProject = trpc.projects.saveProject.useMutation({
    retry: false
  });
  const createProject = trpc.projects.createProject.useMutation({
    retry: false
  });

  return {
    saveProject: async (project: Project, layout: Section[]) => {
      if (project.title === "") {
        toast.error("Cannot save project without title");
        return;
      }
      if (project.id.length === 32) {
        const res = await createProject.mutateAsync({
          project: { title: project.title },
          layout: layout.map(x => {
            const {id, projectId, ...data} = x;
            return data;
          })
        });
        if (isError(res)) {
          toast.error("Error creating project");
          return;
        }
        project = { ...project, ...res.project, created: new Date(res.project.created), updated: new Date(res.project.updated) };
        updateProject(project);
      }
      saveProject.mutateAsync({
        project: {
          ...project,
          created: project.created.toISOString(),
          updated: project.updated.toISOString()
        },
        layout
      }).then(() => toast.info("Successfully saved project!"))
        .catch(() => toast.error("Error saving project"));
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

  const [project, setProject] = useState<Project | null>(null);
  const tags = useMemo(() => (tags_.status === "success" &&
  !isError(tags_.data) ? tags_.data : []).concat(project?.tags ?? [])
    .filter((x, i, arr) =>
      arr.indexOf(x) === i), [tags_.data, tags_.status, project?.tags]);

  useEffect(() => {
    if (project_.status !== "success" || project_.data === null ||
      isError(project_.data)) return;
    setProject({
      ...project_.data,
      created: new Date(project_.data.created),
      updated: new Date(project_.data.updated)
    });
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
    updateProject,
    createProject: setProject
  };
};

export const useFiles = (projectId: string, token: string) => {
  const files_ = trpc.projects.getFiles.useQuery({ projectId });
  const thumbnail = trpc.projects.generateThumbnail
    .useMutation({ retry: false });
  const [files, setFiles] = useState<TFile[]>([]);

  useEffect(() => {
    if (files_.status !== "success" || isError(files_.data)) return;
    setFiles(files_.data);
  }, [files_.status, files_.data]);

  const uploadRawFile = async (name: string, file: File) => {
    const url = await (await fetch(`${env.CORE_URL}/api/v${env.CORE_API_VERSION}/project/${projectId}/file/${name}/presigned/put`, { headers: { Authorization: `Bearer ${token}` } })).json();
    if (isError(url)) {
      toast.error(url.oveError);
      return;
    }
    await fetch(url as string, { method: "PUT", body: file });
  };

  const checkForFormatting = async (name: string, file: File) => {
    const extension = file.name.split(".").at(-1);
    if (extension === undefined) throw new Error("Missing file extension");
    const dataType = dataTypes.find(dt => dt.extensions.includes(`.${extension}`));
    if (dataType === undefined) throw new Error("Invalid file extension");
    if (dataType.requiresFormatting) {
      await uploadFormattedFile(name, extension, dataType, file);
    }
  };

  const uploadFormattedFile = async (name: string, extension: string, dataType: DataType, file: File) => {
    const data = await file.text();

    const formatted = await (await fetch(`${env.CORE_URL}/api/v${env.CORE_API_VERSION}/project/data/format`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      method: "POST",
      body: Json.stringify({
        data,
        dataType: dataType.name,
        title: name,
        opts: dataType.name === "data-table" ? {
          containsHeader: false,
          tableSource: extension
        } : undefined
      })
    })).json();
    const formattedFile = new File([formatted.data], formatted.fileName, { type: "text/plain" });

    const url = await (await fetch(`${env.CORE_URL}/api/v${env.CORE_API_VERSION}/project/${projectId}/file/${formatted.fileName}/presigned/put`, { headers: { Authorization: `Bearer ${token}` } })).json();
    if (isError(url)) throw new Error(url.oveError);
    await fetch(url as string, { method: "PUT", body: formattedFile });
  };

  const uploadFile = async (name: string, file: File) => {
    if (files.find(file => file.name === name && file.isGlobal) !== undefined) {
      toast.error("Cannot upload a global file");
      return;
    }

    try {
      await uploadRawFile(name, file);
      await checkForFormatting(name, file);
      files_.refetch().catch();
    } catch (e) {
      toast.error(`Unable to upload file ${name}`);
    }
  };

  const generateThumbnail = () => thumbnail.mutateAsync({ projectId })
    .then(() => toast.info("Generated thumbnail"))
    .catch(() => toast.error("Error generating thumbnail"));

  const getData = async (file: TFile) => {
    const url: string = Json.parse(await (await fetch(
      // eslint-disable-next-line max-len
      `${env.CORE_URL}/api/v${env.CORE_API_VERSION}/project/${file.bucketName}/file/${file.name}/${file.version}/presigned/get`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )).text());
    return (await fetch(url)).text();
  };

  const getLatest = (bucketName: string, name: string) => {
    name = name.startsWith(`${bucketName}/`) ? assert(name.split("/").at(-1)) : name;
    const file = files.find(file => file.name === name && file.bucketName === bucketName && file.isLatest);
    if (!file) throw new Error("File not found");
    return file;
  };

  const hasVersion = (bucketName: string, name: string, version: string) => {
    name = name.startsWith(`${bucketName}/`) ? assert(name.split("/").at(-1)) : name;
    return files.filter(file => file.name === name && file.bucketName === bucketName).map(f => f.version).includes(version);
  };

  const toURL = (bucketName: string, name: string, version: string) =>
    `/store/${bucketName}/${name}?versionId=${version}`;
  const fromURL = (url: string | null) => {
    if (url === null) return null;
    const parsed = /^\/store\/(.+)\/(.+)\?versionId=(.+)$/.exec(url);
    if (parsed === null || parsed.length !== 4) return null;
    return files.find(({
      bucketName,
      name,
      version
    }) => bucketName === parsed[1] && name === parsed[2] && version === parsed[3]) ?? null;
  };

  return {
    assets: files.filter(({ name }) => !["control", "env"].includes(name)),
    uploadFile,
    hasVersion,
    getLatest,
    toURL,
    fromURL,
    getData,
    generateThumbnail
  };
};

export const useCollaboration = (project: Project) => {
  const users_ = trpc.projects.getUsers.useQuery();
  const invites_ = trpc.projects.getInvitesForProject
    .useQuery({ projectId: project.id });
  const inviteCollaborator_ = trpc.projects.inviteCollaborator.useMutation();
  const removeCollaborator_ = trpc.projects.removeCollaborator.useMutation();
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);

  useEffect(() => {
    if (users_.status !== "success" || isError(users_.data)) return;
    setUsers(users_.data);
  }, [users_.status, users_.data]);

  useEffect(() => {
    if (invites_.status !== "success" || isError(invites_.data)) return;
    setInvites(invites_.data.map(invite => ({
      ...invite,
      sent: new Date(invite.sent)
    })));
  }, [invites_.status, invites_.data]);

  const uninvited = users
    .filter(user => (project.collaboratorIds.concat([project.creatorId]))
      .find(id => id === user.id) === undefined && invites.find(({
      recipientId,
      status
    }) => recipientId === user.id && status === "pending") === undefined);
  const accepted = project.collaboratorIds
    .map(id => users.find(user => user.id === id))
    .filter(Boolean)
    .concat(users.filter(user => user.id === project.creatorId))
    .filter((x, i, arr) => arr.indexOf(x) === i);
  const invited = invites
    .filter(({ status }) => status === "pending")
    .map(({ recipientId }) => users.find(({ id }) =>
      id === recipientId)).filter(Boolean);

  const inviteCollaborator = (id: string) => {
    inviteCollaborator_.mutateAsync(
      { projectId: project.id, collaboratorId: id }).catch(logger.error);
    invites_.refetch().catch(logger.error);
  };

  const removeCollaborator = (id: string) => {
    if (id === project.creatorId) return;
    const user = assert(users.find(user => user.id === id));
    if (user.id === assert(users.find(({ id }) =>
      id === project.creatorId)).username) return;
    removeCollaborator_.mutateAsync(
      { projectId: project.id, collaboratorId: id }).catch(logger.error);
    invites_.refetch().catch(logger.error);
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
