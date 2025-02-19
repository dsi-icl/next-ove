import {
  Button,
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ove/ui-base-components";
import React, { type RefObject, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import type { FilterValue } from "../columns";

export type SearchSelectProps = {
  values: string[];
  setFilter: (filter: string | null) => void;
  ref: RefObject<HTMLElement | null>;
} & Omit<FilterValue, "selected">;

const SearchSelect = ({
  values,
  setFilter,
  filter,
  filterType,
  ref,
}: SearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const filterLabel = useMemo(
    () => (filterType === "id" ? "ID" : "tag"),
    [filterType],
  );
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="mr-2 w-[200px] justify-between"
        >
          {filter
            ? (values.find((value) => filter === value) ?? "")
            : `Select ${filterLabel}...`}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" container={ref.current}>
        <Command>
          <CommandInput
            placeholder={`Search ${filterLabel}...`}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No {filterLabel} found.</CommandEmpty>
            <CommandGroup>
              {values.map((value) => (
                <CommandItem
                  key={value}
                  value={value}
                  onSelect={(currentValue) => {
                    setFilter(currentValue === filter ? null : currentValue);
                    setOpen(false);
                  }}
                >
                  {value}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === filter ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchSelect;
