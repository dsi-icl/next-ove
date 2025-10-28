"use client";

import * as React from "react";
import { type RefObject, useMemo } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const Item = (
  props: ComboboxProps & { v: { value: string; label: string } },
) => {
  return (
    <CommandItem
      key={props.v.value}
      value={props.v.value}
      onSelect={(currentValue) => {
        props.setValue(
          props.value.includes(currentValue)
            ? props.value.filter((val) => val !== currentValue)
            : [...props.value, currentValue],
        );
      }}
    >
      <CheckIcon
        className={cn(
          "mr-2 h-4 w-4",
          props.value.includes(props.v.value) ? "opacity-100" : "opacity-0",
        )}
      />
      {props.v.label}
    </CommandItem>
  );
};

type ComboboxProps = {
  value: string[];
  setValue: (value: string[]) => void;
  options: { value: string; label: string }[];
  label: string;
  ref: RefObject<HTMLElement | null>;
};

export function Combobox(props: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const sortedValues = useMemo(() => {
    return {
      selected: props.options
        .filter((v) => props.value.includes(v.value))
        .toSorted((a, b) => a.value.localeCompare(b.value)),
      unselected: props.options
        .filter((v) => !props.value.includes(v.value))
        .toSorted((a, b) => a.value.localeCompare(b.value)),
    };
  }, [props.value, props.options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {props.value.length > 0
            ? `${props.value.length} selected`
            : `Select ${props.label}`}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent container={props.ref.current} className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${props.label}`} />
          <CommandList>
            <CommandEmpty>No {props.label} found.</CommandEmpty>
            {sortedValues.selected.length > 0 ? (
              <CommandGroup>
                {sortedValues.selected.map((v) => (
                  <Item {...props} v={v} />
                ))}
              </CommandGroup>
            ) : null}
            {sortedValues.selected.length > 0 &&
            sortedValues.unselected.length > 0 ? (
              <CommandSeparator />
            ) : null}
            {sortedValues.unselected.length > 0 ? (
              <CommandGroup>
                {sortedValues.unselected.map((v) => (
                  <Item {...props} v={v} />
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
