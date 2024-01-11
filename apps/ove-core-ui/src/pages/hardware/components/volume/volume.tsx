import React from "react";
import ValueModal from "../value-modal/value-modal";
import { useStore } from "../../../../store";

const Volume = () => {
  const setDeviceAction = useStore(state =>
    state.hardwareConfig.setDeviceAction);
  const deviceAction = useStore(state =>
    state.hardwareConfig.deviceAction);
  const setVolume = useStore(state => state.hardwareConfig.setVolume);

  const onSubmit = ({ volume }: { volume: string }) => {
    setVolume(parseInt(volume));
    console.log(deviceAction);
    setDeviceAction({ ...deviceAction, pending: false });
  };

  return <ValueModal k="volume" label="Volume" header="Enter Volume:"
                     onSubmit={onSubmit} />;
};

export default Volume;
