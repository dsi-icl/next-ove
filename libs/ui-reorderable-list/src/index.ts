import { type ComponentType, CSSProperties, type ReactNode } from "react";
// @ts-expect-error - JSX
import Item from "./lib/reorderable-list/components/reorderable-item.jsx";
// @ts-expect-error - JSX
import List from "./lib/reorderable-list/components/reorderable-list.jsx";

export const ReorderableItem: ComponentType<{ children: ReactNode }> = Item;
export const ReorderableList: ComponentType<{
  children: ReactNode,
  list: object[],
  onListUpdate: (newList: object[]) => void,
  style: CSSProperties
}> = List;
