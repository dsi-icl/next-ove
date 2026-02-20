import { useLogsStore } from "../store";
import Filters from "./filters";
import LatencyCard from "./latency-card";
import ServiceHealthCard from "./service-health-card";
import ErrorRateCard from "./error-rate-card";
import LatencyChart from "./latency-chart";
import LiveSlowSpans from "./live-slow-spans";
import LiveTraces from "./live-traces";
import LiveLogs from "./live-logs";
import { Sheet, SheetContent } from "@ove/ui-base-components";
import TraceExplorer from "./trace-explorer";


const Overview = () => {
  const selectedTrace = useLogsStore((state) => state.selectedTrace);
  const setSelectedTrace = useLogsStore((state) => state.setSelectedTrace);
  return (
    <div className="space-y-6 p-6">
      <Filters />

      <div className="grid grid-cols-3 gap-6">
        <ServiceHealthCard />
        <LatencyCard />
        <ErrorRateCard />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <LatencyChart />
        <LiveSlowSpans />
      </div>

      <LiveTraces />
      <LiveLogs />

      <Sheet
        open={!!selectedTrace}
        onOpenChange={() => setSelectedTrace(undefined)}
      >
        <SheetContent side="right" className="w-[800px] overflow-y-auto">
          <TraceExplorer traceId={selectedTrace} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Overview;
