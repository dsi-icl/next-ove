import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@radix-ui/react-hover-card";
import { env } from "../../../../env";
import { assert } from "@ove/ove-utils";
import { useEffect, useMemo } from "react";
import { api } from "../../../../utils/api";
import { type Bounds, isError } from "@ove/ove-types";

import styles from "./preview.module.scss";

type ScreenHUDProps = {
  row: number
  column: number
  displayId: string
  renderer: {
    deviceId: string
    displayId: string
  }
  windowConfig: string
  url: string
  isPopover: boolean
}

const ScreenHUD = ({
  row,
  column,
  displayId,
  renderer,
  windowConfig,
  url,
  isPopover
}: ScreenHUDProps) => {
  return <ul className={[styles.hud].concat(isPopover ? [styles.popover] : []).join(" ")}>
    <li>
      <span>row</span>
      <span>{row}</span>
    </li>
    <li>
      <span>column</span>
      <span>{column}</span>
    </li>
    <li>
      <span>display id</span>
      <span>{displayId}</span>
    </li>
    <li>
      <span>renderer</span>
      <span>{renderer.deviceId}, {renderer.displayId}</span>
    </li>
    <li>
      <span>default url</span>
      <span>{windowConfig.slice(0, 15)}{windowConfig !== "" ? "..." : ""}</span>
    </li>
    <li>
      <span>current url</span>
      <span>{url.slice(0, 15)}{url !== "" ? "..." : ""}</span>
    </li>
  </ul>;
};

const useWindowConfig = (
  bridgeId: string,
  deviceId: string,
  displayId: string
) => {
  const getWindowConfig = api.hardware.getWindowConfig.useQuery({
    bridgeId,
    deviceId
  });

  return useMemo((): string => {
    if (getWindowConfig.status !== "success") return "";
    const res = getWindowConfig.data.response;
    if (isError(res)) return "";
    return res[displayId];
  }, [getWindowConfig.status, getWindowConfig.data?.response, displayId]);
};

const useBrowser = (bridgeId: string, deviceId: string, displayId: string) => {
  const getBrowsers = api.hardware.getBrowsers.useQuery({
    bridgeId,
    deviceId
  });

  return useMemo((): string => {
    if (getBrowsers.status !== "success") return "";
    const res = getBrowsers.data.response;
    if (isError(res)) return "";
    return Array.from(Object.values(res))
      .find(({ displayId: id }) => id === parseInt(displayId))?.url ?? "";
  }, [getBrowsers.status, getBrowsers.data?.response, displayId]);
};

const useLiveFeed = (bridgeId: string, deviceId: string, displayId: string) => {
  const takeScreenshot = api.hardware.screenshot.useMutation({ retry: false });

  const screenshot = useMemo(() => {
    if (takeScreenshot.status !== "success") return takeScreenshot.status === "loading" ? "loading" as const : undefined;
    const res = takeScreenshot.data.response;
    if (isError(res)) return undefined;
    return res[0];
  }, [takeScreenshot.status, takeScreenshot.data?.response]);

  useEffect(() => {
    const interval = setInterval(() => {
      takeScreenshot.mutateAsync({
        bridgeId,
        deviceId: deviceId,
        method: "response",
        screens: [parseInt(displayId)]
      });
    }, env.LIVE_FEED_REFRESH);

    return () => {
      clearInterval(interval);
    };
  }, [bridgeId, deviceId, displayId, takeScreenshot]);

  return screenshot;
};

const Screen = ({ colId, bounds, rowId, bridgeId, setSelected, selected }: {
  bridgeId: string,
  colId: number,
  rowId: number,
  bounds: Bounds
  setSelected: (v: string[] | null) => void
  selected: string[] | null
}) => {
  const display = assert(bounds.displays.find(({
    row,
    column
  }) => column === colId + 1 && row === rowId + 1));
  const windowConfig = useWindowConfig(bridgeId,
    display.renderer.deviceId, display.renderer.displayId);
  const browser = useBrowser(bridgeId, display.renderer.deviceId,
    display.renderer.displayId);
  const screenshot = useLiveFeed(bridgeId,
    display.renderer.deviceId, display.renderer.displayId);
  const aspectRatio = [bounds.width / bounds.columns,
    bounds.height / bounds.rows];

  const getScreenshotWithLoading = () => {
    if (screenshot === undefined) {
      return <ScreenHUD row={display.row} column={display.column}
                        displayId={display.displayId}
                        renderer={display.renderer} windowConfig={windowConfig}
                        url={browser} isPopover={false} />;
    } else if (screenshot === "loading") return null;
    else return <img src={`data:image/png;base64,${screenshot}`}
                     alt="screenshot" />;
  };

  return <li key={colId} className={styles.screen} style={{
    width: `calc(100% / ${bounds.columns})`,
    aspectRatio: `${aspectRatio[0]}/${aspectRatio[1]}`
  }}>
    <HoverCard>
      <HoverCardTrigger style={{ width: "100%" }}>
        <button style={{ width: "100%" }} onClick={() => {
          if (selected?.[0] === display.displayId &&
            selected?.[1] === display.renderer.deviceId) {
            setSelected(null);
          } else {
            setSelected([display.displayId, display.renderer.deviceId]);
          }
        }}>{getScreenshotWithLoading()}</button>
      </HoverCardTrigger>
      <HoverCardContent>
        {/*TODO: improve popover HUD once v0.2.2 changes merged*/}
        {screenshot !== undefined && screenshot !== "loading" ?
          <ScreenHUD row={display.row} column={display.column} isPopover={true}
                     displayId={display.displayId} renderer={display.renderer}
                     windowConfig={windowConfig} url={browser} /> : null}
      </HoverCardContent>
    </HoverCard>
  </li>;
};

export default Screen;
