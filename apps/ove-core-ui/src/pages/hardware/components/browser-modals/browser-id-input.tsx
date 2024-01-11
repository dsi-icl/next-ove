import React from "react";
import { useStore } from "../../../../store";
import ValueModal from "../value-modal/value-modal";

const BrowserIdInput = () => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const setDeviceAction = useStore(state =>
    state.hardwareConfig.setDeviceAction);
  const setBrowserId = useStore(state => state.hardwareConfig.setBrowserId);

  const onSubmit = ({ browserId }: { browserId: string }) => {
    setBrowserId(parseInt(browserId));
    setDeviceAction({ ...deviceAction, pending: false });
  };

  return <ValueModal k="browserId" label="Browser ID"
                     header="Get Browser Status For:" onSubmit={onSubmit} />;
};

export default BrowserIdInput;
