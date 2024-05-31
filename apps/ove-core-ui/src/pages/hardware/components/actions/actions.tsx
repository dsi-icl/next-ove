import React from "react";
import MDCActions from "./mdc-actions";
import NodeActions from "./node-actions";
import ProjectorActions from "./projector-actions";
import type { ActionController } from "../../types";

const Actions = ({ device, bridgeId }: ActionController) => {
  switch (device.type) {
    case "node":
      return <NodeActions device={device} bridgeId={bridgeId} />;
    case "mdc":
      return <MDCActions device={device} bridgeId={bridgeId} />;
    case "pjlink":
      return <ProjectorActions device={device} bridgeId={bridgeId} />;
  }
};

export default Actions;
