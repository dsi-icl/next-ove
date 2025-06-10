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

const params = new URLSearchParams(window.location.search);

const type = params.get("type") as "view" | "controller";
window.onload = () => {
  switch (params.get("data-type")) {
    case "html": {
      if (type === "controller") {
        initHTMLController();
      } else {
        initHTMLView();
      }
      break;
    }
    case "images": {
      if (type === "controller") {
        initImagesController();
      } else {
        initImagesView();
      }
      break;
    }
    case "maps": {
      if (type === "controller") {
        initMapsController();
      } else {
        initMapsView();
      }
      break;
    }
    case "networks": {
      if (type === "controller") {
        initNetworkController();
      } else {
        initNetworkView();
      }
      break;
    }
    case "videos": {
      if (type === "controller") {
        initVideoController();
      } else {
        initVideoView();
      }
      break;
    }
    case "web-rtc": {
      if (type === "controller") {
        initWebRTCController();
      } else {
        initWebRTCView();
      }
      break;
    }
    default:
      if (type === "controller") {
        initController();
      } else {
        // TODO: update identifier
        initView(params.get("observatory") ?? "", "");
      }
      break;
  }
};
