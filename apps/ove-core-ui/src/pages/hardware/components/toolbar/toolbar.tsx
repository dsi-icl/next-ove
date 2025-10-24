import React from "react";
import HardwareControls, {
  type HardwareControlsProps,
} from "./hardware-controls";
import Calendar from "./calendar";
import LiveFeed from "./live-feed";
import PowerMode from "./power-mode";
import PowerControls from "./power-controls";
import Reconciliation from "./reconciliation";
import AutoSchedule from "./auto-schedule";

type ToolbarProps = HardwareControlsProps;

const Toolbar = ({
  devices,
  setFilterType,
  setFilter,
  filterType,
  selected,
  filter,
  bridgeId,
}: ToolbarProps) => (
  <div className="mb-2 flex w-full flex-wrap items-center justify-between gap-6">
    <Reconciliation bridgeId={bridgeId} />
    <LiveFeed bridgeId={bridgeId} />
    <Calendar bridgeId={bridgeId} />
    <AutoSchedule bridgeId={bridgeId} />
    <PowerMode bridgeId={bridgeId} />
    <HardwareControls
      devices={devices}
      filterType={filterType}
      filter={filter}
      selected={selected}
      setFilterType={setFilterType}
      setFilter={setFilter}
      bridgeId={bridgeId}
    />
    <PowerControls bridgeId={bridgeId} />
  </div>
);

export default Toolbar;
