import { useLogsStore } from "../store";
import { Button, Switch } from "@ove/ui-base-components";

const Filters = () => {
  const filters = useLogsStore();

  const quickRange = (minutes: number) => {
    const end = new Date();
    const start = new Date(Date.now() - minutes * 60 * 1000);
    filters.setFilters({
      start: start.toISOString(),
      end: end.toISOString(),
    });
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <Button
        variant="outline"
        onClick={() => quickRange(5)}
      >
        5m
      </Button>
      <Button
        variant="outline"
        onClick={() => quickRange(60)}
      >
        1h
      </Button>
      <Button
        variant="outline"
        onClick={() => quickRange(360)}
      >
        6h
      </Button>

      {filters.view === "overview" ? <div className="flex items-center gap-2">
        <span className="text-sm">Live</span>
        <Switch
          checked={filters.live}
          onCheckedChange={(v) =>
            filters.setFilters({ live: v })
          }
        />
      </div> : null}
    </div>
  );
};

export default Filters;
