import React from "react";
import NodeActions from "./node-actions";
import { type ActionController } from "../../types";
import MDCActions from "./mdc-actions";
import ProjectorActions from "./projector-actions";

const Actions = ({ device, bridgeId, refetch }: ActionController) => {
  if (device.type === "node") {
    return <NodeActions device={device} bridgeId={bridgeId}
                        refetch={refetch} />;
  } else if (device.type === "mdc") {
    return <MDCActions device={device} bridgeId={bridgeId} refetch={refetch} />;
  } else {
    return <ProjectorActions device={device} bridgeId={bridgeId}
                             refetch={refetch} />;
  }
};

export default Actions;
