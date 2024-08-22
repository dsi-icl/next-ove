import { state } from "../state";
import { raise } from "@ove/ove-utils";
import type { Controller } from "./router";
import type { Project, Section } from "@prisma/client";

const initObservatory = async (observatory: string, project: Project, layout: Section[]) => {
  const observatoryState = state.rendering.get(observatory);
  if (observatoryState === undefined) {
    return raise("Missing observatory state");
  }

  observatoryState.state = {project, layout};
  observatoryState.sections = new Map();
};

const clearObservatory = async (observatory: string) => {
  const observatoryState = state.rendering.get(observatory);
  if (observatoryState === undefined) {
    return raise("Missing observatory state");
  }

  observatoryState.state = null;
  observatoryState.sections = new Map();
};

export const controller: Controller = {
  initObservatory,
  clearObservatory
};
