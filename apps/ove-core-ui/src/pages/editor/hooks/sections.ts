import { nanoid } from "nanoid";
import { assert } from "@ove/ove-utils";
import { api } from "../../../utils/api";
import { useProjectId } from "./projects";
import { useSectionStore } from "./stores";
import { type Section } from ".prisma/client";
import { useCallback, useEffect, useState } from "react";

export const useInitSections = () => {
  const projectId = useProjectId();
  const [isLoading, setIsLoading] = useState(true);
  const { status, data } = api.projects.getSectionsForProject.useQuery(
    { projectId: projectId ?? "ERROR" },
    { enabled: projectId !== null },
  );
  const setSections = useSectionStore((state) => state.setSections);

  useEffect(() => {
    if (status !== "success") return;
    setSections(data.map(({ created_at, updated_at, ...rest}) => ({
      ...rest,
      created_at: new Date(created_at),
      updated_at: new Date(updated_at),
    })));
    setIsLoading(false);
  }, [setSections, setIsLoading, status, data]);

  return projectId !== null && isLoading;
};

// GET IT – NEW ORDER/BLUE MONDAY. I'M SO FUNNY.
const reorder = (id: string, blueMonday: number, sections: Section[]) => {
  const section = assert(sections.find((section) => section.id === id));
  const removed = sections.filter((section) => section.id !== id);
  return [
    ...removed.slice(0, blueMonday).map((x, i) => ({ ...x, ordering: i })),
    { ...section, ordering: blueMonday },
    ...removed.slice(blueMonday).map((x, i) => ({
      ...x,
      ordering: i + 1 + blueMonday,
    })),
  ];
};

export const useUpdateSection = () => {
  const setSections = useSectionStore((state) => state.setSections);
  const selected = useSectionStore((state) => state.selectedSection);
  const setSelected = useSectionStore((state) => state.setSelectedSection);
  return useCallback(
    (section: Omit<Section, "id">) => {
      setSections((cur) => {
        const newSectionId = selected ?? nanoid(32);
        const newSections = cur
          .filter(({ id }) => id !== selected)
          .concat([
            {
              ...section,
              ordering: cur.length,
              id: newSectionId,
            },
          ]);
        return reorder(
          newSectionId,
          parseInt(section.ordering.toString()),
          newSections,
        );
      });
      setSelected(null);
    },
    [setSections, setSelected, selected],
  );
};

export const usePartialUpdateSection = () => {
  const section = useSectionStore((state) => state.selectedSection);
  const setSections = useSectionStore((state) => state.setSections);

  return useCallback((part: Partial<Section>) => {
    setSections((curr) => {
      if (!section) return curr;
      return curr.map((s) =>
        s.id === section
          ? {
              ...s,
              ...part,
            }
          : s,
      );
    })
  }, [setSections, section]);
}

export const useDragSection = () => {
  const setSections = useSectionStore((state) => state.setSections);

  return useCallback(
    (id: string, x: number, y: number) => {
      setSections((cur) =>
        cur.map((section) =>
          section.id === id
            ? {
                ...section,
                x,
                y,
              }
            : section,
        ),
      );
    },
    [setSections],
  );
};

export const useRemoveStateFromSections = () => {
  const setSections = useSectionStore((state) => state.setSections);
  return useCallback(
    (state: string) => {
      const filter = (section: Section) =>
        section.states.filter((s) => s !== state);
      setSections((cur) =>
        cur
          .map((section) => {
            if (!section.states.includes(state)) return section;
            if (section.states.length === 1) return undefined;
            return {
              ...section,
              states: filter(section),
            };
          })
          .filter(Boolean),
      );
    },
    [setSections],
  );
};

export const useUpdateStateForSections = () => {
  const setSections = useSectionStore((state) => state.setSections);

  return useCallback(
    (state: string, name: string) => {
      const map = (section: Section) =>
        section.states.map((c) => (c === state ? name : c));
      setSections((cur) =>
        cur.map((section) =>
          !section.states.includes(state)
            ? section
            : {
                ...section,
                states: map(section),
              },
        ),
      );
    },
    [setSections],
  );
};

export const useSections = () => {
  const sections = useSectionStore((state) => state.sections);
  const setSections = useSectionStore((state) => state.setSections);
  const selected = useSectionStore((state) => state.selectedSection);
  const setSelected = useSectionStore((state) => state.setSelectedSection);

  const addToState = useCallback(
    (id: string, state: string) => {
      setSections((cur) =>
        cur.map((section) =>
          section.id !== id || section.states.includes(state)
            ? section
            : {
                ...section,
                states: section.states.concat([state]),
              },
        ),
      );
    },
    [setSections],
  );

  const removeFromState = useCallback(
    (id: string, state: string) => {
      if (id === selected) {
        setSelected(null);
      }
      const filter = (section: Section) =>
        section.states.filter((s) => s !== state);
      setSections((cur) => {
        let newSections = cur
          .map((section) => {
            if (section.id !== id) return section;
            if (section.states.length === 1) return undefined;
            return {
              ...section,
              states: filter(section),
            };
          })
          .filter(Boolean);

        if (newSections.length !== cur.length) {
          newSections = newSections.map((section, i) => ({
            ...section,
            ordering: i,
          }));
        }

        return newSections;
      });
    },
    [setSelected, setSections, selected],
  );

  const generateSection = useCallback(
    (state: string, projectId: string) => {
      const newSectionId = nanoid(32);
      setSections((cur) =>
        [...cur].concat([
          {
            id: newSectionId,
            x: 0,
            y: 0,
            width: 0.25,
            height: 0.25,
            ordering: cur.length,
            asset: "",
            assetId: null,
            dataType: "",
            projectId,
            states: [state],
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]),
      );
      setSelected(newSectionId);
    },
    [setSelected, setSections],
  );

  const getSectionsInState = useCallback(
    (state: string) => sections.filter(({ states }) => states.includes(state)),
    [sections],
  );
  const getSectionsToImport = useCallback(
    (from: string, to: string) =>
      sections.filter(
        ({ states }) => states.includes(from) && !states.includes(to),
      ),
    [sections],
  );

  return {
    all: sections,
    getSections: getSectionsInState,
    getSectionsToImport,
    setSections,
    reorder,
    select: setSelected,
    selected,
    addToState,
    removeFromState,
    generateSection,
  };
};
