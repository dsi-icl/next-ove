import React, { useCallback, useState } from "react";
import type { ActionController } from "../../types";
import {
  useCloseBrowsers, useMute, useMuteAudio, useMuteVideo, useOpenBrowsers,
  useReboot,
  useShutdown,
  useStart,
  useUnmute, useUnmuteAudio, useUnmuteVideo
} from "./hooks";
import { useStore } from "../../../../store";
import {
  Button, Dialog,
  DialogContent,
  DialogTrigger,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "@ove/ui-base-components";
import {
  MoreVertical,
  Power,
  PowerOff,
  RefreshCcw,
  Info,
  RotateCw,
  Terminal,
  Camera,
  Library,
  X,
  ExternalLink,
  Volume1,
  Volume2,
  VolumeOff,
  Mic,
  MicOff,
  Video,
  VideoOff
} from "lucide-react";
import { Device } from "@ove/ove-types";
import { api } from "../../../../utils/api";
import InfoContainer from "../info/info-container";
import { flushSync } from "react-dom";
import TerminalDialog from "../terminal";

const getType = (device: Device | null, type: Device["type"], negate = false) => device === null || (negate ? device.type !== type : device.type === type);

type Actions = "info" | "terminal" | null

const getActionDialog = (action: Actions, deviceId: string | null, bridgeId: string, tag?: string) => {
  switch (action) {
    case "info":
      return <InfoContainer deviceId={deviceId} bridgeId={bridgeId} tag={tag} />;
    case "terminal":
      return <TerminalDialog deviceId={deviceId} bridgeId={bridgeId} tag={tag} />;
    default:
      return <DialogContent></DialogContent>;
  }
};

const Actions = ({ device, tag, bridgeId, status }: ActionController) => {
  const utils = api.useUtils();
  const [action, setAction] = useState<Actions>(null);
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  const { start } = useStart(bridgeId, device?.id ?? null, tag);
  const { shutdown } = useShutdown(bridgeId, device?.id ?? null, tag);
  const { reboot } = useReboot(bridgeId, device?.id ?? null, tag);
  const { closeBrowsers } = useCloseBrowsers(bridgeId, device?.id ?? null, tag);
  const { openBrowsers } = useOpenBrowsers(bridgeId, device?.id ?? null, tag);
  const { mute } = useMute(bridgeId, device?.id ?? null, tag);
  const { unmute } = useUnmute(bridgeId, device?.id ?? null, tag);
  const { muteAudio } = useMuteAudio(bridgeId, device?.id ?? null, tag);
  const { unmuteAudio } = useUnmuteAudio(bridgeId, device?.id ?? null, tag);
  const { muteVideo } = useMuteVideo(bridgeId, device?.id ?? null, tag);
  const { unmuteVideo } = useUnmuteVideo(bridgeId, device?.id ?? null, tag);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const updateState = useCallback(() => {
    if (device !== null) {
      utils.hardware.getStatus.invalidate({ bridgeId, deviceId: device.id });
    } else {
      utils.hardware.getStatusAll.invalidate({ bridgeId, tag });
    }
  }, [utils.hardware.getStatus, device, bridgeId, tag]);
  return <Dialog open={open} onOpenChange={async (newIsOpen) => {
    flushSync(() => {
      setOpen(newIsOpen);
      setDropdownOpen(false);
    });
  }}>
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end"
                           className="overflow-y-scroll max-h-[45vh]">
        <DropdownMenuItem className="cursor-pointer" onClick={updateState}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          <span>Status</span>
        </DropdownMenuItem>
        <DialogTrigger asChild onClick={() => setAction("info")}>
          <DropdownMenuItem className="cursor-pointer">
            <Info className="mr-2 h-4 w-4" />
            Info
          </DropdownMenuItem>
        </DialogTrigger>
        {status !== null ? <DropdownMenuItem className="cursor-pointer"
                                             onClick={status === "on" ? shutdown : start}>
          {status === "on" ? <>
            <Power className="mr-2 h-4 w-4" />
            Power On
          </> : <>
            <PowerOff className="mr-2 h-4 w-4" />
            Power Off
          </>}
        </DropdownMenuItem> : <>
          <DropdownMenuItem className="cursor-pointer" onClick={start}>
            <Power className="mr-2 h-4 w-4" />
            Power On
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={shutdown}>
            <PowerOff className="mr-2 h-4 w-4" />
            Power Off
          </DropdownMenuItem>
        </>}
        <DropdownMenuItem className="cursor-pointer" onClick={reboot}>
          <RotateCw className="mr-2 h-4 w-4" />
          Reboot
        </DropdownMenuItem>
        {getType(device, "node") ? <DialogTrigger className="w-full" onClick={() => setAction("terminal")}>
          <DropdownMenuItem className="cursor-pointer w-full">
          <Terminal className="mr-2 h-4 w-4" />
          Execute
        </DropdownMenuItem>
        </DialogTrigger> : null}
        {getType(device, "node") ? <DropdownMenuItem className="cursor-pointer"
                                                     onClick={() => setDeviceAction({
                                                       bridgeId,
                                                       action: "screenshot",
                                                       deviceId: device?.id ?? null,
                                                       tag: undefined,
                                                       pending: true
                                                     })}>
          <Camera className="mr-2 h-4 w-4" />
          Take Screenshot
        </DropdownMenuItem> : null}
        {getType(device, "node") ? <DropdownMenuItem className="cursor-pointer"
                                                     onClick={() => setDeviceAction({
                                                       bridgeId,
                                                       action: "browser",
                                                       deviceId: device?.id ?? null,
                                                       tag: undefined,
                                                       pending: false
                                                     })}>
          <Library className="mr-2 h-4 w-4" />
          Window Info
        </DropdownMenuItem> : null}
        {getType(device, "node") ?
          <DropdownMenuItem className="cursor-pointer" onClick={openBrowsers}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Windows
          </DropdownMenuItem> : null}
        {getType(device, "node") ?
          <DropdownMenuItem className="cursor-pointer" onClick={closeBrowsers}>
            <X className="mr-2 h-4 w-4" />
            Close Windows
          </DropdownMenuItem> : null}
        {getType(device, "node", true) ?
          <DropdownMenuItem className="cursor-pointer"
                            onClick={() => setDeviceAction({
                              bridgeId,
                              action: "volume",
                              deviceId: device?.id ?? null,
                              tag: undefined,
                              pending: true
                            })}>
            <Volume1 className="mr-2 h-4 w-4" />
            Set Volume
          </DropdownMenuItem> : null}
        {getType(device, "node", true) ?
          <DropdownMenuItem className="cursor-pointer" onClick={mute}>
            <VolumeOff className="mr-2 h-4 w-4" />
            Mute
          </DropdownMenuItem> : null}
        {getType(device, "node", true) ?
          <DropdownMenuItem className="cursor-pointer" onClick={unmute}>
            <Volume2 className="mr-2 h-4 w-4" />
            Unmute
          </DropdownMenuItem> : null}
        {getType(device, "pjlink") ?
          <DropdownMenuItem className="cursor-pointer" onClick={muteAudio}>
            <MicOff className="mr-2 h-4 w-4" />
            Mute Audio
          </DropdownMenuItem> : null}
        {getType(device, "pjlink") ?
          <DropdownMenuItem className="cursor-pointer" onClick={unmuteAudio}>
            <Mic className="mr-2 h-4 w-4" />
            Unmute Audio
          </DropdownMenuItem> : null}
        {getType(device, "pjlink") ?
          <DropdownMenuItem className="cursor-pointer" onClick={muteVideo}>
            <VideoOff className="mr-2 h-4 w-4" />
            Mute Video
          </DropdownMenuItem> : null}
        {getType(device, "pjlink") ?
          <DropdownMenuItem className="cursor-pointer" onClick={unmuteVideo}>
            <Video className="mr-2 h-4 w-4" />
            Unmute Video
          </DropdownMenuItem> : null}
      </DropdownMenuContent>
    </DropdownMenu>
    {open ? getActionDialog(action, device?.id ?? null, bridgeId, tag) : null}
  </Dialog>;
};

export default Actions;
