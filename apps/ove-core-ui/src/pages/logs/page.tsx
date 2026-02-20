import { SidebarProvider } from "@ove/ui-base-components";
import LogsSidebar from "./sidebar";
import { useLogsStore } from "./store";
import Overview from "./components/overview";
import HistoricalTraces from "./components/historical-traces";
import HistoricalLogs from "./components/historical-logs";

const getContent = (view: string)=> {
  switch (view) {
    case "overview":
      return <Overview />
    case "traces":
      return <HistoricalTraces />
    case "logs":
      return <HistoricalLogs />
  }
}

const LogsPage = () => {
  const view = useLogsStore((store) => store.view);
  return (
    <SidebarProvider className="flex flex-row size-full">
      <LogsSidebar />
      <div className="size-full">{getContent(view)}</div>
    </SidebarProvider>
  );
}

export default LogsPage;
