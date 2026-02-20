import { create } from "zustand";

export type DocsView =
  | "overview"
  | "apis"
  | "code"
  | "features"
  | "types"
  | "css-compatibility"
  | "package-audit"
  | "package-deprecation"
  | "package-directory"
  | "package-security"
  | "package-updates"
  | "unused-packages"
  | "spec"
  | "bundle"
  | "coverage-tests"
  | "coverage-types";

type DocsStore = {
  view: DocsView;
  feature: string | undefined;
  test: string | undefined;
  api: string | undefined;
  bundle: string | undefined;
  spec: string | undefined;
  setView: (view: DocsView) => void;
  setFeature: (feature: string) => void;
  setTest: (test: string) => void;
  setApi: (api: string) => void;
  setBundle: (bundle: string) => void;
  setSpec: (spec: string) => void;
};

export const useDocsStore = create<DocsStore>((set) => {
  return {
    view: "overview",
    feature: undefined,
    test: undefined,
    api: undefined,
    spec: undefined,
    bundle: undefined,
    setView: (view) =>
      set((state) => ({
        view,
        feature: view === "features" ? state.feature : undefined,
        test: view === "coverage-tests" ? state.test : undefined,
        api: view === "apis" ? state.api : undefined,
        bundle: view === "bundle" ? state.bundle : undefined,
        spec: view === "spec" ? state.spec : undefined,
      })),
    setFeature: (feature) => set({ view: "features", feature }),
    setTest: (test) => set({ view: "coverage-tests", test }),
    setApi: (api) => set({ view: "apis", api }),
    setBundle: (bundle) => set({ view: "bundle", bundle }),
    setSpec: (spec) => set({ view: "spec", spec }),
  };
});
