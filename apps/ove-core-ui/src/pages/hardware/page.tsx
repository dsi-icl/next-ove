import { trpc } from "../../utils/api";
import { useStore } from "../../store";
import { type DeviceAction } from "./types";
import Popups from "./components/popups/popups";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Observatory from "./components/observatory/observatory";
import { type CSSProperties, useCallback, useEffect } from "react";
import { Dialog, Snackbar, useDialog, useSnackbar } from "@ove/ui-components";

import styles from "./page.module.scss";

const Hardware = () => {
  const getObservatories = trpc.core.getObservatories.useQuery();
  const { notification, show: showNotification, isVisible } = useSnackbar();
  const { ref, closeDialog, openDialog, isOpen } = useDialog();
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const reset = useStore(state => state.hardwareConfig.reset);
  const setPaginationIdx = useStore(state => state.hardwareConfig.setPaginationIdx);

  const isSpecial = (action: DeviceAction["action"]) => action === "info" || action === "execute" || action === "screenshot" || action === "monitoring" || action === "calendar" || action === "power_mode";
  const getStyle = useCallback((deviceAction: DeviceAction): CSSProperties | undefined => {
    switch (deviceAction.action) {
      case "monitoring": return {width: "90vw", height: "90vh"};
      case "volume":
      case "browser_open":
      case "browser":
      case "browser_close": return {width: "25vw", height: "20vh"};
      case "calendar": return {width: "65vw", height: "80svh"};
      default: return undefined;
    }
  }, []);

  useEffect(() => {
    if (isOpen) return;
    reset();
  }, [isOpen]);

  useEffect(() => {
    setPaginationIdx(0);
    if (!isSpecial(deviceAction.action) && !deviceAction.pending) return;
    if (deviceAction.action === null) {
      closeDialog();
    } else {
      openDialog();
    }
  }, [deviceAction]);

  return <HelmetProvider>
    <main className={styles.main}>
      <Helmet>
        <title>next-ove - Hardware</title>
      </Helmet>
      <h1>Hardware Manager</h1>
      {getObservatories.status === "success" && !("oveError" in getObservatories.data) ? getObservatories.data?.map(({
        name,
        isOnline
      }) =>
        <Observatory name={name} isOnline={isOnline} key={name}
                     showNotification={showNotification} />) : null}
      <Dialog closeDialog={closeDialog} ref={ref} style={getStyle(deviceAction)}
              title={deviceAction.deviceId ?? deviceAction.bridgeId ?? ""}>
        <Popups isOpen={isOpen} />
      </Dialog>
      <Snackbar text={notification ?? ""} show={isVisible} />
    </main>
  </HelmetProvider>;
};

export default Hardware;