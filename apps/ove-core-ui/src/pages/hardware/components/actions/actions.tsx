import NodeActions from "./node-actions";
import { type ActionController } from "../../types";
import MDCActions from "./mdc-actions";
import ProjectorActions from "./projector-actions";

const Actions = ({ setDeviceAction, device }: ActionController) => {
  if (device.type === "node") {
    return <NodeActions setDeviceAction={setDeviceAction} device={device} />
  } else if (device.type === "mdc") {
    return <MDCActions setDeviceAction={setDeviceAction} device={device} />;
  } else {
    return <ProjectorActions setDeviceAction={setDeviceAction} device={device} />
  }
};

export default Actions;
