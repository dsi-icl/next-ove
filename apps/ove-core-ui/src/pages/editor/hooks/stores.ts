import { env } from "../../../env";
import { create } from "zustand/index";
import type { Section } from ".prisma/client";

type PreviewPos = { 
  id: string; 
  xPct: number;
  yPct: number; 
  wPct: number;
  hPct: number;
  xGrid: number; 
  yGrid: number; 
  wGrid: number; 
  hGrid: number;
} | null;

type SectionStore = {
  sections: Section[]
  setSections: (arg: ((sections: Section[]) => Section[]) | Section[]) => void
  selectedSection: string | null
  setSelectedSection: (selectedSection: string | null) => void
  previewPos: PreviewPos
  setPreviewPos: (previewPos: PreviewPos) => void
  configMode: 'grid' | 'custom'
  setConfigMode: (configMode: 'grid' | 'custom') => void
  isAspectById: Record<string, boolean>
  setIsAspectById: (id: string, useAspectRatio: boolean) => void
  aspectRatioById: Record<string, number | null>
  setAspectRatioById: (id: string, aspectRatio: number) => void
}

const order = (sections: Section[]) =>
  [...sections.sort((a, b) => a.ordering - b.ordering)];

export const useSectionStore = create<SectionStore>(set => ({
  sections: [],
  setSections: arg => set(state => Array.isArray(arg) ? { sections: order(arg) } : { sections: order(arg(state.sections)) }),
  selectedSection: null,
  setSelectedSection: selectedSection => set({ selectedSection }),
  previewPos: null,
  setPreviewPos: previewPos => set({ previewPos }),
  configMode: 'grid',
  setConfigMode: (configMode: 'grid' | 'custom') => set({ configMode }),
  isAspectById: {},
  setIsAspectById: (id, useAspectRatio) => set(state => ({ isAspectById: { ...state.isAspectById, [id]: useAspectRatio } })),
  aspectRatioById: {},
  setAspectRatioById: (id, ratio) => set(state => ({ aspectRatioById: { ...state.aspectRatioById, [id]: ratio } })),
}));

type StateStore = {
  selectedState: string
  setSelectedState: (selectedState: string) => void
  states: string[]
  setStates: (arg: ((customStates: string[]) => string[]) | string[]) => void
  nextIndex: number
  addState: () => void
  updateState: (oldState: string, newState: string) => void
  removeState: (state: string) => void
}

export const useStateStore = create<StateStore>(set => ({
  selectedState: env.CONSTANTS.DEFAULT_STATE,
  setSelectedState: selectedState => set({ selectedState }),
  states: [env.CONSTANTS.DEFAULT_STATE],
  setStates: arg => set(state => Array.isArray(arg) ? { states: arg } : { states: arg(state.states) }),
  nextIndex: 1,
  addState: () => set(state => ({
    selectedState: `${env.CONSTANTS.NEW_STATE_PREFIX}${state.nextIndex}`,
    states: [...state.states, `${env.CONSTANTS.NEW_STATE_PREFIX}${state.nextIndex}`],
    nextIndex: state.nextIndex + 1,
  })),
  updateState: (oldState: string, newState: string) => set(state => ({
    selectedState: newState,
    states: state.states.map(c => c === oldState ? newState : c)
  })),
  removeState: (state: string) => set(store => ({
    states: store.states.filter(c => c !== state),
    selectedState: env.CONSTANTS.DEFAULT_STATE,
  }))
}));