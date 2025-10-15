import {
  Button,
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  useFormErrorHandling,
} from "@ove/ui-base-components";
import { useForm } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

type ScreenshotConfigProps = {
  displays: { value: string; label: string }[];
  method: TransferMethod;
  setMethod: (method: TransferMethod) => void;
  takeScreenshots: (screens: string[], method: TransferMethod) => void;
  transition: () => void;
};

export type TransferMethod = "response" | "upload" | "local";

const ScreenshotConfig = ({
  displays,
  method,
  setMethod,
  takeScreenshots,
  transition,
}: ScreenshotConfigProps) => {
  const [screens, setScreens] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    handleSubmit,
    formState: { errors },
  } = useForm();
  useFormErrorHandling(errors);

  const onSubmit = useCallback(() => {
    takeScreenshots(screens, method);
    transition();
  }, [takeScreenshots, screens, method, transition]);

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Screenshot Options</DialogTitle>
        <DialogDescription>
          Select how you want the screenshots to be taken
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="method">Transfer Method</Label>
            <RadioGroup
              id="method"
              value={method}
              onValueChange={(v) => setMethod(v as TransferMethod)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="response" id="response" />
                <Label htmlFor="response">Response</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="upload" />
                <Label htmlFor="upload">Upload</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="local" id="local" />
                <Label htmlFor="local">Local</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid gap-2" ref={containerRef}>
            <Label htmlFor="screens">Screens to Capture</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {screens.length > 0
                    ? `${screens.length} screen${screens.length > 1 ? "s" : ""} selected`
                    : "Select screens..."}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-0"
                container={containerRef.current}
              >
                <Command>
                  <CommandInput placeholder="Search screens..." />
                  <CommandList>
                    <CommandEmpty>No screen found.</CommandEmpty>
                    <CommandGroup>
                      {displays.map((screen) => (
                        <CommandItem
                          key={screen.value}
                          className="cursor-pointer"
                          onSelect={() => {
                            setScreens((prev) =>
                              prev.includes(screen.value)
                                ? prev.filter((item) => item !== screen.value)
                                : [...prev, screen.value],
                            );
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              screens.includes(screen.value)
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {screen.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Submit</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default ScreenshotConfig;
