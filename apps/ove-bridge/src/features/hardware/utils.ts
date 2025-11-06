import type { ServiceType } from "@ove/ove-types";
import NodeService, { type NodeService as TNodeService } from "./node-service";
import PJLinkService, { type PJLinkService as TPJLinkService } from "./pjlink-service";
import MDCService, { type MDCService as TMDCService } from "./mdc-service";

export const getServiceForProtocol =
  (protocol: ServiceType): TNodeService | TPJLinkService | TMDCService => {
    switch (protocol) {
      case "node":
        return NodeService;
      case "pjlink":
        return PJLinkService;
      case "mdc":
        return MDCService;
    }
  };
