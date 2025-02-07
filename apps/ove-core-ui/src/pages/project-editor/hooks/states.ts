import {
  useRemoveStateFromSections,
  useUpdateStateForSections
} from "./sections";
import { useCallback, useMemo } from "react";
import { useSectionStore, useStateStore } from "./stores";

export const formatState = (state: string) => {
  if (state === "__default__") return "*";
  if (state.startsWith("__new__")) return `New (${state.slice(7)})`;
  return state;
};

export const useRemoveState = () => {
  const removeState = useStateStore(state => state.removeState);
  const selectSection = useSectionStore(state => state.setSelectedSection);
  const removeStateFromSections = useRemoveStateFromSections();

  return useCallback((state: string) => {
    removeState(state);
    removeStateFromSections(state);
    selectSection(null)
  }, [removeState, removeStateFromSections, selectSection]);
};

export const useUpdateState = () => {
  const updateStateForSections = useUpdateStateForSections();
  const updateState = useStateStore(state => state.updateState);

  return useCallback((oldState: string, newState: string) => {
    updateStateForSections(oldState, newState);
    updateState(oldState, newState)
  }, [updateStateForSections]);
};

export const useStates = () => {
  const sections = useSectionStore(state => state.sections);
  const customStates = useStateStore(state => state.states);
  return useMemo(() => customStates
    .slice(0, 1)
    .concat(sections.flatMap(({ states }) => states).filter((x, i, arr) => arr.indexOf(x) === i))
    .concat(customStates.slice(1))
    .filter((x, i, arr) => arr.indexOf(x) === i), [customStates, sections]);
};