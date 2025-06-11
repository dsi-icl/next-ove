import React, { useState } from "react";
import Live from "./components/live";
import Historical from "./components/historical";
import {
  Button,
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  DateTimePicker,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
} from "@ove/ui-base-components";
import { useAppIds } from "./hooks/app-ids";
import { LogLevels } from "@ove/ove-logging";
import { useSocketInit } from "./hooks/socket-init";
import { Check, ChevronsUpDown } from "lucide-react";

const Logs = () => {
  const [mode, setMode] = useState<"live" | "historical">("live");
  const { allIds, appIds, setAppIds } = useAppIds();
  const [levels, setLevels] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [keywords, setKeywords] = useState<string>("");
  useSocketInit(mode);

  return (
    <main>
      <h1 className="py-4 text-center text-2xl font-bold">Logs</h1>
      <section className="flex flex-col px-12">
        <div className="align-r my-2 grid w-full grid-cols-2 grid-rows-2 gap-2">
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {appIds.length > 0
                    ? `${appIds.length} app${appIds.length > 1 ? "s" : ""} selected`
                    : "Select apps..."}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" container={undefined}>
                <Command>
                  <CommandInput placeholder="Search apps..." />
                  <CommandList>
                    <CommandEmpty>No app found.</CommandEmpty>
                    <CommandGroup>
                      {allIds.map((appId) => (
                        <CommandItem
                          key={appId}
                          className="cursor-pointer"
                          onSelect={() => {
                            setAppIds((prev) =>
                              prev.includes(appId)
                                ? prev.filter((item) => item !== appId)
                                : [...prev, appId],
                            );
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              appIds.includes(appId)
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {appId}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {levels.length > 0
                    ? `${levels.length} level${levels.length > 1 ? "s" : ""} selected`
                    : "Select levels..."}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" container={undefined}>
                <Command>
                  <CommandInput placeholder="Search levels..." />
                  <CommandList>
                    <CommandEmpty>No level found.</CommandEmpty>
                    <CommandGroup>
                      {LogLevels.map((level) => (
                        <CommandItem
                          key={level}
                          className="cursor-pointer"
                          onSelect={() => {
                            setLevels((prev) =>
                              prev.includes(level)
                                ? prev.filter((item) => item !== level)
                                : [...prev, level],
                            );
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              levels.includes(level)
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {level}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex w-full gap-2">
            <div className="w-full">
              <Label htmlFor="start-date">Start</Label>
              <DateTimePicker
                id="start-date"
                date={startDate}
                setDate={setStartDate}
              />
            </div>
            <div className="w-full">
              <Label htmlFor="end-date">End</Label>
              <DateTimePicker
                id="end-date"
                date={endDate}
                setDate={setEndDate}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="search-input">Search for</Label>
            <Input
              id="search-input"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-4 ml-auto flex items-center space-x-2">
          <Switch
            id="mode"
            checked={mode === "live"}
            onCheckedChange={(checked) =>
              setMode(checked ? "live" : "historical")
            }
          />
          <Label htmlFor="mode">Live</Label>
        </div>
        {mode === "live" ? (
          <Live
            appIds={appIds.length === 0 ? undefined : appIds}
            dates={
              startDate === undefined && endDate === undefined
                ? undefined
                : [
                    {
                      start: startDate ?? null,
                      end: endDate ?? null,
                    },
                  ]
            }
            levels={levels.length === 0 ? undefined : levels}
            keywords={keywords === "" ? undefined : [keywords]}
          />
        ) : (
          <Historical
            startDate={startDate}
            endDate={endDate}
            appIds={appIds.length === 0 ? undefined : appIds}
            levels={levels.length === 0 ? undefined : levels}
            keywords={keywords === "" ? undefined : [keywords]}
          />
        )}
      </section>
    </main>
  );
};

export default Logs;
