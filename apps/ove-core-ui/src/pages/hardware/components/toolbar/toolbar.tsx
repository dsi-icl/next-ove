import React, { useCallback, useMemo, useState, memo, useEffect } from "react";
import type { HardwareInfo } from "../../types";
import SearchSelect from "../search-select/search-select";
import Actions from "../actions/actions";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem, Dialog, DialogTrigger,
  DialogContent, DialogHeader, DialogTitle
} from "@ove/ui-base-components";
import { api } from "../../../../utils/api";
import { isError, type PowerMode } from "@ove/ove-types";
import {
  Video,
  Calendar as CalendarIcon,
  Power,
  PowerOff,
  Leaf
} from "lucide-react";
import { logger } from "../../../../env";
import { toast } from "sonner";
import CalendarView from "../calendar/calendar";
import { VideoStreams } from "@ove/ui-components";

const useStreams = (bridgeId: string, isOpen: boolean) => {
  const streams = api.bridge.getStreams.useQuery({ bridgeId });
  const startStreams = api.bridge.startStreams.useMutation({retry: false});
  const stopStreams = api.bridge.stopStreams.useMutation({retry: false});

  useEffect(() => {
    if (isOpen) {
      startStreams.mutateAsync({ bridgeId }).catch(logger.error);
    } else {
      stopStreams.mutateAsync({ bridgeId }).catch(logger.error);
    }
  }, [isOpen, bridgeId, startStreams.mutateAsync, stopStreams.mutateAsync]);

  return streams;
};

const LiveFeed = memo(({ bridgeId }: { bridgeId: string }) => {
  const [open, setOpen] = useState(false);
  const streams = useStreams(bridgeId, open);

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button variant="outline">
        <Video className="mr-2 h-4 w-4" />
        Live Feed
      </Button>
    </DialogTrigger>
    <DialogContent className="w-[90vw] max-w-[unset] h-[90vh]"
                   style={{ gridTemplateRows: "1rem auto" }}>
      <DialogHeader>
        <DialogTitle>Observatory Live Feed</DialogTitle>
      </DialogHeader>
      {streams.status === "success" && !isError(streams.data.response) ?
        <VideoStreams streams={streams.data.response} /> : null}
    </DialogContent>
  </Dialog>;
});

const Calendar = ({ bridgeId }: { bridgeId: string }) => <Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">
      <CalendarIcon className="mr-2 h-4 w-4" />
      View Calendar
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-[unset] w-[65vw] h-[60vh]"
                 style={{ gridTemplateRows: "1rem auto" }}
                 aria-description="calendar content">
    <DialogHeader className="h-fit">
      <DialogTitle id="calendar-title">Observatory Calendar</DialogTitle>
    </DialogHeader>
    <CalendarView bridgeId={bridgeId} />
  </DialogContent>
</Dialog>;

const Reconciliation = ({ bridgeId }: { bridgeId: string }) => {
  const reconciliationStatus = api.bridge.getReconciliation.useQuery({ bridgeId });
  const apiUtils = api.useUtils();
  const startReconciliation =
    api.bridge.startReconciliation.useMutation();
  const stopReconciliation =
    api.bridge.stopReconciliation.useMutation();

  const start = useCallback(async () => {
    await startReconciliation.mutateAsync({ bridgeId })
      .catch(logger.error);
    apiUtils.bridge.getReconciliation.invalidate().catch(logger.error);
  }, [startReconciliation, bridgeId, apiUtils.bridge.getReconciliation]);

  const stop = useCallback(async () => {
    await stopReconciliation.mutateAsync({ bridgeId })
      .catch(logger.error);
    apiUtils.bridge.getReconciliation.invalidate().catch(logger.error);
  }, [stopReconciliation, bridgeId, apiUtils.bridge.getReconciliation]);

  return reconciliationStatus.data !== undefined && !isError(reconciliationStatus.data.response) ?
    <Button
      onClick={reconciliationStatus.data.response === true ? stop : start}
      variant={reconciliationStatus.data.response === true ? "destructive" : "default"}>
      {reconciliationStatus.data.response === true ? "Stop Reconciliation" : "Start Reconciliation"}
    </Button> : null;
};

const PowerMode = ({ bridgeId }: { bridgeId: string }) => {
  const apiUtils = api.useUtils();
  const getPowerMode = api.bridge.getMode.useQuery({ bridgeId });
  const setManual = api.bridge.setManualSchedule.useMutation({
    onSuccess: () => apiUtils.bridge.getMode.invalidate({ bridgeId })
  });
  const setAuto = api.bridge.setAutoSchedule.useMutation({
    onSuccess: () => apiUtils.bridge.getMode.invalidate({ bridgeId })
  });
  const setEco = api.bridge.setAutoSchedule.useMutation({
    onSuccess: () => apiUtils.bridge.getMode.invalidate({ bridgeId })
  });
  const powerMode: PowerMode = useMemo(() => {
    if (getPowerMode.data === undefined || isError(getPowerMode.data.response)) return "manual";
    return getPowerMode.data.response;
  }, [getPowerMode.data]);
  const updatePowerMode = useCallback((mode: string) => {
    switch (mode) {
      case "manual":
        setManual.mutateAsync({ bridgeId });
        break;
      case "auto":
        setAuto.mutateAsync({ bridgeId });
        break;
      case "eco":
        setEco.mutateAsync({ bridgeId });
        break;
      default:
        throw new Error(`Unknown power mode: ${mode}`);
    }
  }, [setManual, setAuto, setEco, bridgeId]);

  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">
        <Leaf className="mr-2 h-4 w-4" />
        Set Power Mode
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuRadioGroup value={powerMode}
                              onValueChange={updatePowerMode}>
        <DropdownMenuRadioItem value="manual">Manual</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="auto">Auto</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="eco">Eco</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>;
};

const ObservatoryPower = ({ bridgeId }: { bridgeId: string }) => {
  const powerOn = api.hardware.startAll.useMutation({
    retry: false,
    onSuccess: () => toast.info("Successfully powered on"),
    onError: () => toast.error("Failed to power on")
  });
  const powerOff = api.hardware.shutdownAll.useMutation({
    retry: false,
    onSuccess: () => toast.info("Successfully powered off"),
    onError: () => toast.error("Failed to power off")
  });

  return <div className="flex">
    <Button variant="destructive"
            className="rounded-r-none w-[50%] basis-1/2 grow"
            onClick={() => powerOff.mutateAsync({ bridgeId })}>
      <PowerOff className="mr-2 h-4 w-4" />
      Power Off
    </Button>
    <Button variant="default"
            className="rounded-l-none w-[50%] grow basis-1/2"
            onClick={() => powerOn.mutateAsync({ bridgeId })}>
      <Power className="mr-2 h-4 w-4" />
      Power On
    </Button>
  </div>;
};

const Hardware = ({
  filterType,
  filter,
  selected,
  setFilter,
  setFilterType,
  hardware,
  bridgeId
}: ToolbarProps) => {
  const searchValues = useMemo(() => hardware.flatMap(({
    device: {
      id,
      tags
    }
  }) => filterType === "id" ? [id] : tags).filter((v, i, arr) => arr.indexOf(v) === i && (selected === null || selected.includes(v))), [hardware, filterType, selected]);
  const tag = filterType === "tags" ? (filter ?? undefined) : undefined;
  const device = filterType === "id" ? hardware.find(({ device: { id } }) => id === filter) ?? null : null;

  return <div className="flex items-center">
    <p>Filter by:</p>
    <div className="ml-1 mr-2 grow">
      <Button variant={filterType === "id" ? "default" : "outline"}
              onClick={() => setFilterType("id")}
              className="rounded-r-none w-[50%] basis-1/2 grow">ID
      </Button>
      <Button variant={filterType === "tags" ? "default" : "outline"}
              onClick={() => setFilterType("tags")}
              className="rounded-l-none w-[50%] basis-1/2 grow">Tags
      </Button>
    </div>
    <SearchSelect setFilter={setFilter} filter={filter}
                  filterType={filterType}
                  values={searchValues} />
    <Actions bridgeId={bridgeId} tag={tag} device={device?.device ?? null}
             status={device?.status ?? null} />
  </div>;
};

type ToolbarProps = {
  hardware: HardwareInfo[]
  setFilterType: (type: "id" | "tags") => void
  setFilter: (filter: string | null) => void
  filterType: "id" | "tags"
  filter: string | null
  selected: string[] | null
  bridgeId: string
}

const Toolbar = ({
  hardware,
  setFilterType,
  setFilter,
  filterType,
  selected,
  filter,
  bridgeId
}: ToolbarProps) => <div
  className="flex items-center gap-6 justify-between mb-2 max-w-[90vw] flex-wrap">
  <Reconciliation bridgeId={bridgeId} />
  <LiveFeed bridgeId={bridgeId} />
  <Calendar bridgeId={bridgeId} />
  <PowerMode bridgeId={bridgeId} />
  <ObservatoryPower bridgeId={bridgeId} />
  <Hardware hardware={hardware} filterType={filterType} filter={filter}
            selected={selected} setFilterType={setFilterType}
            setFilter={setFilter} bridgeId={bridgeId} />
</div>;

export default Toolbar;
