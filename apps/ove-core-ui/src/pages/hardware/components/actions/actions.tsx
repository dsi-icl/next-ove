import {
  useCloseBrowsers,
  useMute,
  useMuteAudio,
  useMuteVideo,
  useOpenBrowsers,
  useReboot,
  useReloadBrowsers,
  useSetSource,
  useShutdown,
  useStart,
  useUnmute,
  useUnmuteAudio,
  useUnmuteVideo,
} from "./hooks";
import {
  Camera,
  ExternalLink,
  Globe,
  HdmiPort,
  Info,
  Library,
  Mic,
  MicOff,
  Monitor,
  MoreVertical,
  Power,
  PowerOff,
  Projector,
  RefreshCcw,
  RotateCw,
  Terminal,
  Video,
  VideoOff,
  Volume1,
  Volume2,
  VolumeOff,
  X,
} from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@ove/ui-base-components";
import Volume from "../volume";
import { useStatus } from "../hooks";
import { flushSync } from "react-dom";
import WindowInfo from "../window-info";
import type { Device } from "@ove/ove-types";
import TerminalDialog from "../terminal";
import { logger } from "../../../../env";
import { api } from "../../../../utils/api";
import Screenshot from "../screenshot/screenshot";
import InfoContainer from "../info/info-container";
import React, { useCallback, useState } from "react";

const getType = (device: Device | null, type: Device["type"], negate = false) =>
  device === null || (negate ? device.type !== type : device.type === type);

type TActions =
  | "info"
  | "terminal"
  | "screenshot"
  | "window-info"
  | "volume"
  | null;

const getActionDialog = (
  action: TActions,
  closeDialog: () => void,
  devices: Device[],
  device: Device | null,
  bridgeId: string,
  tag?: string,
) => {
  switch (action) {
    case "info":
      return (
        <InfoContainer
          devices={devices}
          device={device}
          bridgeId={bridgeId}
          tag={tag}
        />
      );
    case "terminal":
      return (
        <TerminalDialog
          deviceId={device?.id ?? null}
          bridgeId={bridgeId}
          tag={tag}
        />
      );
    case "screenshot":
      return (
        <Screenshot
          deviceId={device?.id ?? null}
          bridgeId={bridgeId}
          tag={tag}
          closeDialog={closeDialog}
        />
      );
    case "window-info":
      return (
        <WindowInfo
          deviceId={device?.id ?? null}
          bridgeId={bridgeId}
          tag={tag}
        />
      );
    case "volume":
      return (
        <Volume
          deviceId={device?.id ?? null}
          bridgeId={bridgeId}
          tag={tag}
          closeDialog={closeDialog}
        />
      );
    default:
      return <DialogContent></DialogContent>;
  }
};

type ActionProps = {
  device: Device | null;
  tag?: string;
  bridgeId: string;
  devices: Device[];
};

const Actions = ({ device, devices, tag, bridgeId }: ActionProps) => {
  const status = useStatus(device?.id ?? null, bridgeId);
  const utils = api.useUtils();
  const [action, setAction] = useState<TActions>(null);
  const { start } = useStart(bridgeId, device?.id ?? null, tag);
  const { shutdown } = useShutdown(bridgeId, device?.id ?? null, tag);
  const { reboot } = useReboot(bridgeId, device?.id ?? null, tag);
  const { reloadBrowsers } = useReloadBrowsers(
    bridgeId,
    device?.id ?? null,
    tag,
  );
  const { closeBrowsers } = useCloseBrowsers(bridgeId, device?.id ?? null, tag);
  const { openBrowsers } = useOpenBrowsers(bridgeId, device?.id ?? null, tag);
  const { setSource } = useSetSource(bridgeId, device?.id ?? null, tag);
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
      utils.hardware.getStatus
        .invalidate({
          bridgeId,
          deviceId: device.id,
        })
        .catch(logger.error);
    } else {
      devices.forEach(({ id }) => {
        utils.hardware.getStatus
          .invalidate({
            bridgeId,
            deviceId: id,
          })
          .catch(logger.error);
      });
    }
  }, [utils.hardware.getStatus, device, bridgeId, devices]);
  return (
    <Dialog
      open={open}
      onOpenChange={async (newIsOpen) => {
        flushSync(() => {
          setOpen(newIsOpen);
          setDropdownOpen(false);
        });
      }}
    >
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="max-h-[45vh] overflow-y-scroll"
        >
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer" onClick={updateState}>
              <RefreshCcw className="mr-2 size-4" />
              <span>Status</span>
            </DropdownMenuItem>
            <DialogTrigger asChild onClick={() => setAction("info")}>
              <DropdownMenuItem className="cursor-pointer">
                <Info className="mr-2 size-4" />
                Info
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {status !== null ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={status === "on" ? shutdown : start}
              >
                {status === "on" ? (
                  <>
                    <PowerOff className="mr-2 size-4" />
                    Power Off
                  </>
                ) : (
                  <>
                    <Power className="mr-2 size-4" />
                    Power On
                  </>
                )}
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem className="cursor-pointer" onClick={start}>
                  <Power className="mr-2 size-4" />
                  Power On
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={shutdown}>
                  <PowerOff className="mr-2 size-4" />
                  Power Off
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem className="cursor-pointer" onClick={reboot}>
              <RotateCw className="mr-2 size-4" />
              Reboot
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {getType(device, "node") ? <DropdownMenuSeparator /> : null}
          <DropdownMenuGroup>
            {getType(device, "node") ? (
              <DialogTrigger
                className="w-full"
                onClick={() => setAction("terminal")}
              >
                <DropdownMenuItem className="w-full cursor-pointer">
                  <Terminal className="mr-2 size-4" />
                  Execute
                </DropdownMenuItem>
              </DialogTrigger>
            ) : null}
            {getType(device, "node") ? (
              <DialogTrigger
                className="w-full"
                onClick={() => setAction("screenshot")}
              >
                <DropdownMenuItem className="w-full cursor-pointer">
                  <Camera className="mr-2 size-4" />
                  Take Screenshot
                </DropdownMenuItem>
              </DialogTrigger>
            ) : null}
          </DropdownMenuGroup>
          {getType(device, "node") ? <DropdownMenuSeparator /> : null}
          <DropdownMenuGroup>
            {getType(device, "node") ? (
              <DialogTrigger
                className="w-full"
                onClick={() => setAction("window-info")}
              >
                <DropdownMenuItem className="w-full cursor-pointer">
                  <Library className="mr-2 size-4" />
                  Window Info
                </DropdownMenuItem>
              </DialogTrigger>
            ) : null}
            {getType(device, "node") ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={reloadBrowsers}
              >
                <Globe className="mr-2 size-4" />
                Reload Windows
              </DropdownMenuItem>
            ) : null}
            {getType(device, "node") ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={openBrowsers}
              >
                <ExternalLink className="mr-2 size-4" />
                Open Windows
              </DropdownMenuItem>
            ) : null}
            {getType(device, "node") ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={closeBrowsers}
              >
                <X className="mr-2 size-4" />
                Close Windows
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
          {getType(device, "node", true) ? <DropdownMenuSeparator /> : null}
          <DropdownMenuGroup>
            {getType(device, "node", true) ? (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <HdmiPort className="mr-2 size-4" />
                  Change Input
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="max-h-[45vh] overflow-y-scroll">
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("AV")}
                      >
                        <Monitor className="mr-2 size-4" />
                        AV
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("COMPONENT")}
                      >
                        <Monitor className="mr-2 size-4" />
                        Component
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "pjlink") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("DIGITAL")}
                      >
                        <Projector className="mr-2 size-4" />
                        Digital
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("DP")}
                      >
                        <Monitor className="mr-2 size-4" />
                        DP
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("DP2")}
                      >
                        <Monitor className="mr-2 size-4" />
                        DP 2
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("DP3")}
                      >
                        <Monitor className="mr-2 size-4" />
                        DP 3
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("DTV")}
                      >
                        <Monitor className="mr-2 size-4" />
                        DTV
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("DVI")}
                      >
                        <Monitor className="mr-2 size-4" />
                        DVI
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("DVI_VIDEO")}
                      >
                        <Monitor className="mr-2 size-4" />
                        DVI Video
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("HDMI1")}
                      >
                        <Monitor className="mr-2 size-4" />
                        HDMI 1
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("DVI")}
                      >
                        <Monitor className="mr-2 size-4" />
                        HDMI 2
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("HDMI1_PC")}
                      >
                        <Monitor className="mr-2 size-4" />
                        HDMI PC 1
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("HDMI2_PC")}
                      >
                        <Monitor className="mr-2 size-4" />
                        HDMI PC 2
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("MAGICNET")}
                      >
                        <Monitor className="mr-2 size-4" />
                        MagicNet
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "pjlink") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("NETWORK")}
                      >
                        <Projector className="mr-2 size-4" />
                        Network
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("PC")}
                      >
                        <Monitor className="mr-2 size-4" />
                        PC
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "pjlink") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("RGB")}
                      >
                        <Projector className="mr-2 size-4" />
                        RGB
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "pjlink") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("STORAGE")}
                      >
                        <Projector className="mr-2 size-4" />
                        Storage
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("SVIDEO")}
                      >
                        <Monitor className="mr-2 size-4" />S Video
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("TV")}
                      >
                        <Monitor className="mr-2 size-4" />
                        TV
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "mdc") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("UNKNOWN")}
                      >
                        <Monitor className="mr-2 size-4" />
                        UNKNOWN
                      </DropdownMenuItem>
                    ) : null}
                    {getType(device, "pjlink") ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSource("VIDEO")}
                      >
                        <Projector className="mr-2 size-4" />
                        Video
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            ) : null}
            {getType(device, "node", true) ? (
              <DialogTrigger
                className="w-full"
                onClick={() => setAction("volume")}
              >
                <DropdownMenuItem className="w-full cursor-pointer">
                  <Volume1 className="mr-2 size-4" />
                  Set Volume
                </DropdownMenuItem>
              </DialogTrigger>
            ) : null}
          </DropdownMenuGroup>
          {getType(device, "node", true) ? <DropdownMenuSeparator /> : null}
          <DropdownMenuGroup>
            {getType(device, "node", true) ? (
              <DropdownMenuItem className="cursor-pointer" onClick={mute}>
                <VolumeOff className="mr-2 size-4" />
                Mute
              </DropdownMenuItem>
            ) : null}
            {getType(device, "node", true) ? (
              <DropdownMenuItem className="cursor-pointer" onClick={unmute}>
                <Volume2 className="mr-2 size-4" />
                Unmute
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
          {getType(device, "pjlink") ? <DropdownMenuSeparator /> : null}
          <DropdownMenuGroup>
            {getType(device, "pjlink") ? (
              <DropdownMenuItem className="cursor-pointer" onClick={muteAudio}>
                <MicOff className="mr-2 size-4" />
                Mute Audio
              </DropdownMenuItem>
            ) : null}
            {getType(device, "pjlink") ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={unmuteAudio}
              >
                <Mic className="mr-2 size-4" />
                Unmute Audio
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
          {getType(device, "pjlink") ? <DropdownMenuSeparator /> : null}
          <DropdownMenuGroup>
            {getType(device, "pjlink") ? (
              <DropdownMenuItem className="cursor-pointer" onClick={muteVideo}>
                <VideoOff className="mr-2 size-4" />
                Mute Video
              </DropdownMenuItem>
            ) : null}
            {getType(device, "pjlink") ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={unmuteVideo}
              >
                <Video className="mr-2 size-4" />
                Unmute Video
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {open
        ? getActionDialog(
            action,
            () => setOpen(false),
            devices,
            device,
            bridgeId,
            tag,
          )
        : null}
    </Dialog>
  );
};

export default Actions;
