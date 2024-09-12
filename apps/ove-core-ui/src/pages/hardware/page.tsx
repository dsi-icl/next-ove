import { api } from "../../utils/api";
import { useStore } from "../../store";
import type { DeviceAction } from "./types";
import Popups from "./components/popups/popups";
import { Dialog, useDialog } from "@ove/ui-components";
import { Helmet, HelmetProvider } from "react-helmet-async";
import React, { type CSSProperties, useEffect } from "react";
import Observatory from "./components/observatory/observatory";

import styles from "./page.module.scss";
import { isError } from "@ove/ove-types";

const getHiddenStyle = (
  deviceAction: DeviceAction): CSSProperties | undefined => {
  switch (deviceAction.action) {
    case "monitoring":
      return { width: "90vw", height: "90vh" };
    default:
      return undefined;
  }
};

const getStyle = (deviceAction: DeviceAction): CSSProperties | undefined => {
  switch (deviceAction.action) {
    case "monitoring":
      return { width: "90vw", height: "90vh", maxHeight: "unset" };
    case "browser": {
      if (deviceAction.pending) {
        return { width: "25vw", height: "30vh" };
      }
      return { width: "35vw", height: "40vh" };
    }
    case "volume":
      return { width: "25vw", height: "30vh" };
    case "calendar":
      return { width: "65vw", height: "80svh" };
    default:
      return undefined;
  }
};

const isSpecial = (action: DeviceAction["action"]) =>
  action === "info" || action === "execute" || action === "screenshot" ||
  action === "monitoring" || action === "calendar" ||
  action === "power_mode" || action === "volume" || action === "browser";

const Hardware = () => {
  const getObservatories = api.core.getObservatories.useQuery();
  const { ref, closeDialog, openDialog, isOpen } = useDialog();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const reset = useStore(state => state.hardwareConfig.reset);

  useEffect(() => {
    if (deviceAction.action === null) {
      closeDialog();
    } else if (isSpecial(deviceAction.action)) {
      openDialog();
    }
  }, [deviceAction, closeDialog, openDialog]);

  return <HelmetProvider>
    <main className={styles.main}>
      <Helmet>
        <title>next-ove - Hardware</title>
      </Helmet>
      <h1>Hardware Manager</h1>
      {getObservatories.status === "success" &&
      !isError(getObservatories.data) ?
        getObservatories.data?.map(({ name, isOnline }) =>
          <Observatory name={name} isOnline={isOnline} key={name} />) : null}
      <Dialog closeDialog={reset} ref={ref} style={getStyle(deviceAction)}
              hiddenStyle={getHiddenStyle(deviceAction)}
              title={deviceAction.deviceId ?? deviceAction.bridgeId ?? ""}>
        <Popups isOpen={isOpen} />
      </Dialog>
    </main>
  </HelmetProvider>;
};

export default Hardware;
