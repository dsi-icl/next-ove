import React from "react";
import HardwareControls, {
  type HardwareControlsProps
} from "./hardware-controls";
import Calendar from "./calendar";
import LiveFeed from "./live-feed";
import PowerMode from "./power-mode";
import PowerControls from "./power-controls";
import Reconciliation from "./reconciliation";

type ToolbarProps = HardwareControlsProps

const Toolbar = ({
  devices,
  setFilterType,
  setFilter,
  filterType,
  selected,
  filter,
  bridgeId
}: ToolbarProps) => <div
  className="flex items-center gap-6 justify-between mb-2 w-full flex-wrap">
  <Reconciliation bridgeId={bridgeId} />
  <LiveFeed bridgeId={bridgeId} />
  <Calendar bridgeId={bridgeId} />
  <PowerMode bridgeId={bridgeId} />
  <HardwareControls devices={devices} filterType={filterType} filter={filter}
                    selected={selected} setFilterType={setFilterType}
                    setFilter={setFilter} bridgeId={bridgeId} />
  <PowerControls bridgeId={bridgeId} />
</div>;

export default Toolbar;
