import { state } from "../state";
import { raise } from "@ove/ove-utils";
import type { Controller } from "./router";
import type { Project, Section } from "@prisma/client";

const initObservatory = async (observatory: string, project: Project, layout: Section[]) => {
  const observatoryState = state.rendering.get(observatory);
  if (observatoryState === undefined) {
    return raise("Missing observatory state");
  }

  observatoryState.state = {project, layout, state: ""}; // TODO: investigate state property
  observatoryState.sections = new Map();
  return undefined;
};

const clearObservatory = async (observatory: string) => {
  const observatoryState = state.rendering.get(observatory);
  if (observatoryState === undefined) {
    return raise("Missing observatory state");
  }

  observatoryState.state = null;
  observatoryState.sections = new Map();
  return undefined;
};

export const controller: Controller = {
  initObservatory,
  clearObservatory
};
