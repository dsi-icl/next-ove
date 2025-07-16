import { init as initNetworkController } from "./networks/controller";
import { init as initNetworkView } from "./networks/view";
import { init as initView } from "./view/main";
import { init as initController } from "./controller/main";
import { init as initHTMLController } from "./html/controller";
import { init as initHTMLView } from "./html/view";
import { init as initImagesController } from "./images/controller";
import { init as initImagesView } from "./images/view";
import { init as initMapsController } from "./maps/controller";
import { init as initMapsView } from "./maps/view";
import { init as initVideoController } from "./videos/controller";
import { init as initVideoView } from "./videos/view";
import { init as initWebRTCController } from "./web-rtc/controller";
import { init as initWebRTCView } from "./web-rtc/view";
import { api, state } from "./state";
import { isError } from "@ove/ove-types";

declare global {
  interface Window {
    originalRandom: (() => number) | undefined;
  }
}

window.onload = async () => {
  const bounds = await api.core.getObservatoryBounds.query();
  if (!isError(bounds)) {
    state.observatory.bounds = bounds[state.observatory.name];
  }
  switch (state.dataType) {
    case "html": {
      if (state.type === "controller") {
        initHTMLController();
      } else {
        initHTMLView();
      }
      break;
    }
    case "image": {
      if (state.type === "controller") {
        initImagesController();
      } else {
        initImagesView();
      }
      break;
    }
    case "map": {
      if (state.type === "controller") {
        initMapsController();
      } else {
        initMapsView();
      }
      break;
    }
    case "network": {
      if (state.type === "controller") {
        initNetworkController();
      } else {
        initNetworkView();
      }
      break;
    }
    case "video": {
      if (state.type === "controller") {
        initVideoController();
      } else {
        initVideoView();
      }
      break;
    }
    case "web-rtc": {
      if (state.type === "controller") {
        initWebRTCController();
      } else {
        initWebRTCView();
      }
      break;
    }
    default:
      if (state.type === "controller") {
        initController();
      } else {
        initView();
      }
      break;
  }
};
