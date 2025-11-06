import Files from "../components/files";
import { assert } from "@ove/ove-utils";
import { useProjectStore } from "./projects";
import Metadata from "../components/metadata";
import EnvEditor from "../components/env-editor";
import LaunchConfig, {
  type TLaunchConfig
} from "../../../components/launch-config/launch-config";
import React, { useCallback, useMemo, useState } from "react";
import ControllerEditor from "../components/controller-editor";
import Controller from "../../../components/controller/controller";
import Preview from "../components/preview";

export type TActions =
  "metadata"
  | "custom-config"
  | "launch"
  | "upload"
  | "controller"
  | "env"
  | "live"
  | "preview"

export const useDialog = () => {
  const project = useProjectStore(state => state.project);
  const [action, setAction] = useState<TActions | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<TLaunchConfig | null>(null);
  const content = useMemo(() => {
    if (project === null || !isOpen) return null;
    switch (action) {
      case "metadata":
        return <Metadata />;
      case "controller": {
        return <ControllerEditor bucket={project.bucket ?? "ERROR"}
                                 projectId={project.id} />;
      }
      case "preview": return <Preview />
      case "upload":
        return <Files />;
      case "launch":
        return <LaunchConfig launch={(config: TLaunchConfig) => {
          setAction("live");
          setConfig(config);
        }} project={project} />;
      case "env": {
        return <EnvEditor bucket={project.bucket ?? "ERROR"}
                          projectId={project.id} />;
      }
      case "live":
        return <Controller config={assert(config)} />;
      default:
        return null;
    }
  }, [action, project, config, setAction, setConfig, isOpen]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    setAction(null);
  }, [setIsOpen, setAction]);

  return {
    isOpen,
    open,
    close,
    setAction,
    content
  };
};