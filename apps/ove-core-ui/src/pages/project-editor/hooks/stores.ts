import { env } from "../../../env";
import { create } from "zustand/index";
import type { Section } from "@prisma/client";

type SectionStore = {
  sections: Section[]
  setSections: (arg: ((sections: Section[]) => Section[]) | Section[]) => void
  selectedSection: string | null
  setSelectedSection: (selectedSection: string | null) => void
}

const order = (sections: Section[]) =>
  [...sections.sort((a, b) => a.ordering - b.ordering)];

export const useSectionStore = create<SectionStore>(set => ({
  sections: [],
  setSections: arg => set(state => Array.isArray(arg) ? { sections: order(arg) } : { sections: order(arg(state.sections)) }),
  selectedSection: null,
  setSelectedSection: selectedSection => set({ selectedSection }),
}));

type StateStore = {
  selectedState: string
  setSelectedState: (selectedState: string) => void
  states: string[]
  setStates: (arg: ((customStates: string[]) => string[]) | string[]) => void
  addState: () => void
  updateState: (oldState: string, newState: string) => void
  removeState: (state: string) => void
}

export const useStateStore = create<StateStore>(set => ({
  selectedState: env.CONSTANTS.DEFAULT_STATE,
  setSelectedState: selectedState => set({ selectedState }),
  states: [env.CONSTANTS.DEFAULT_STATE],
  setStates: arg => set(state => Array.isArray(arg) ? { states: arg } : { states: arg(state.states) }),
  addState: () => set(state => ({
    selectedState: `${env.CONSTANTS.NEW_STATE_PREFIX}${state.states.length}`,
    customStates: [...state.states, `${env.CONSTANTS.NEW_STATE_PREFIX}${state.states.length}`],
  })),
  updateState: (oldState: string, newState: string) => set(state => ({
    selectedState: newState,
    customStates: state.states.map(c => c === oldState ? newState : c)
  })),
  removeState: (state: string) => set(store => ({
    customStates: store.states.filter(c => c !== state),
    selectedState: env.CONSTANTS.DEFAULT_STATE,
  }))
}));