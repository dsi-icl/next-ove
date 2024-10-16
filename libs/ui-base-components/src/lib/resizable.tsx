import { GripVertical } from "lucide-react";
import {
  PanelResizeHandle,
  type PanelResizeHandleProps,
  type PanelGroupProps,
  PanelGroup,
  Panel
} from "react-resizable-panels";

import { cn } from "./utils";
import React, { type JSXElementConstructor } from "react";

// REQUIRED due to ReactNode type error
const PanelResizeHandleElement: (props: PanelResizeHandleProps) =>
  React.ReactElement<unknown, string | JSXElementConstructor<unknown>> | null =
  PanelResizeHandle as (props: PanelResizeHandleProps) =>
    React.ReactElement<unknown, string | JSXElementConstructor<unknown>> | null;

const ResizablePanelGroup = ({
  className,
  ...props
}: PanelGroupProps) => (
  <PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
);

const ResizablePanel = Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: PanelResizeHandleProps & {
  withHandle?: boolean
}) => (
  <PanelResizeHandleElement
    className={cn(
      "relative flex w-px items-center justify-center bg-border " +
      "after:absolute after:inset-y-0 after:left-1/2 after:w-1 " +
      "after:-translate-x-1/2 focus-visible:outline-none " +
      "focus-visible:ring-1 " +
      "focus-visible:ring-ring focus-visible:ring-offset-1 " +
      "data-[panel-group-direction=vertical]:h-px " +
      "data-[panel-group-direction=vertical]:w-full " +
      "data-[panel-group-direction=vertical]:after:left-0 " +
      "data-[panel-group-direction=vertical]:after:h-1 " +
      "data-[panel-group-direction=vertical]:after:w-full " +
      "data-[panel-group-direction=vertical]:after:-translate-y-1/2 " +
      "data-[panel-group-direction=vertical]:after:translate-x-0 " +
      "[&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div
        className="z-10 flex h-4 w-3 items-center
        justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </PanelResizeHandleElement>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
