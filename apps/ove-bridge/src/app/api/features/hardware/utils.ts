import type { ServiceType, TBridgeHardwareService } from "@ove/ove-types";
import NodeService from "./node-service";
import PJLinkService from "./pjlink-service";
import MDCService from "./mdc-service";

export const getServiceForProtocol =
  (protocol: ServiceType): TBridgeHardwareService => {
    switch (protocol) {
      case "node":
        return NodeService;
      case "pjlink":
        return PJLinkService;
      case "mdc":
        return MDCService;
    }
  };
