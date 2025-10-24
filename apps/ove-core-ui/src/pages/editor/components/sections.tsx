import {
  Avatar,
  AvatarFallback,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ove/ui-base-components";
import { env } from "../../../env";
import { dataTypes } from "@ove/ove-types";
import { Json, assert } from "@ove/ove-utils";
import type { Section } from ".prisma/client";
import { useSections } from "../hooks/sections";
import { useStateStore } from "../hooks/stores";
import React, { useMemo, useState } from "react";
import { useProjectId } from "../hooks/projects";
import { Import, PlusCircle, X } from "lucide-react";
import { formatState, useStates } from "../hooks/states";
import { ReorderableItem, ReorderableList } from "@ove/ui-base-components";
import { useObservatory } from "../../../hooks/observatories";

const setSectionsHandler = (curList: Section[], newList: Section[]) => {
  const newListOldOrder = Json.copy(newList).sort(
    (a, b) => a.ordering - b.ordering,
  );
  let startOrder: number | null = null;
  let endOrder: number | null = null;
  newList.forEach((section, i) => {
    const oldOrder = newListOldOrder[i].ordering;
    if (oldOrder !== section.ordering) {
      if (endOrder === null && startOrder === null) {
        endOrder = section.ordering;
        startOrder = oldOrder;
      }
    }
  });

  if (startOrder === null || endOrder === null) {
    return curList;
  }

  return curList
    .slice(0, assert(startOrder))
    .concat(
      [curList[assert(endOrder)]]
        .concat(curList.slice(assert(startOrder), assert(endOrder)))
        .map((section, i) => ({
          ...section,
          ordering: i + assert(startOrder),
        })),
    )
    .concat(curList.slice(assert(endOrder) + 1));
};

const Sections = () => {
  const projectId = useProjectId();
  const [importerOpen, setImporterOpen] = useState(false);
  const sections = useSections();
  const states = useStates();
  const selectedState = useStateStore((state) => state.selectedState);
  const sectionsInState = useMemo(
    () => sections.getSections(selectedState),
    [sections, selectedState],
  );
  const statesForImport = useMemo(
    () => states.filter((s) => s !== selectedState),
    [states, selectedState],
  );

  const observatoryId = useObservatory().id;

  return (
    <section className="h-full grid grid-rows-[auto,1fr,auto]">
      <h2 className="min-h-8 w-full border-b border-[#dadedf] text-center align-middle font-bold">
        Sections
      </h2>
      <ul className="size-full overflow-y-scroll">
        <ReorderableList
          onListUpdate={(newList) =>
            sections.setSections((curList) =>
              setSectionsHandler(curList, newList as Section[]),
            )
          }
          list={sectionsInState}
          style={{}}
        >
          {sectionsInState.map((section) => {
            const backgroundColor =
              dataTypes.find(({ name }) => name === (section.dataType ?? "").toLowerCase())
                ?.color ?? "#888888";
            return (
              <ReorderableItem key={section.id}>
                <li
                  key={section.id}
                  onClick={() => sections.select(section.id)}
                  style={{
                    border:
                      section.id === sections.selected
                        ? "1px solid black"
                        : undefined,
                  }}
                  className="mt-2 flex cursor-pointer items-center justify-between rounded-lg bg-white p-4 shadow"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback
                        className="bg-[#002147]"
                        style={{ color: backgroundColor }}
                      >
                        {section.ordering}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="overflow-hidden text-ellipsis font-medium" style={{ overflowWrap: "anywhere" }}>
                        {section.asset}
                      </p>
                      <p className="text-sm text-gray-500">
                        {section.dataType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() =>
                        sections.removeFromState(section.id, selectedState)
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </li>
              </ReorderableItem>
            );
          })}
        </ReorderableList>
      </ul>
      <div className="m-2 flex gap-2 pt-2">
        {states.length > 1 ? (
          <DropdownMenu open={importerOpen} onOpenChange={setImporterOpen}>
            <DropdownMenuTrigger asChild>
              <Button title="Import" className="flex-1">
                Import Section
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Select a section</DropdownMenuLabel>
              {statesForImport?.map((state_, i) => (
                <DropdownMenuGroup
                  key={state_}
                  className={i !== 0 ? "mt-4" : "mt-0"}
                >
                  <div className="relative size-full">
                    <DropdownMenuSeparator className="relative" />
                    <DropdownMenuLabel
                      className={cn(
                        "absolute left-2 bg-white",
                        state_ === env.CONSTANTS.DEFAULT_STATE
                          ? "-top-3"
                          : "-top-4",
                      )}
                    >
                      {formatState(state_)}
                    </DropdownMenuLabel>
                  </div>
                  {sections
                    .getSectionsToImport(state_, selectedState)
                    .map((section, j) => (
                      <DropdownMenuItem
                        key={section.id}
                        className={cn(
                          "w-full cursor-pointer",
                          j === 0 ? "mt-4" : "mt-0",
                        )}
                        onSelect={() => {
                          sections.addToState(section.id, selectedState);
                          setImporterOpen(false);
                        }}
                      >
                        {section.ordering}. {section.asset}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <Button
          className="flex-1 "
          title="Add Section"
          disabled={!observatoryId}
          onClick={() =>
            sections.generateSection(selectedState, assert(projectId))
          }
        >
          Add Section
        </Button>
      </div>
    </section>
  );
};

export default Sections;
