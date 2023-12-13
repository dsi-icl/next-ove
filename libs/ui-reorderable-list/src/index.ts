import { type ComponentType, CSSProperties, type ReactNode } from "react";
// @ts-expect-error - JSX
import ReOrderableItem from "./lib/reorderable-list/components/reorderable-item.jsx";
// @ts-expect-error - JSX
import ReOrderableList from "./lib/reorderable-list/components/reorderable-list.jsx";

export const ReorderableItem: ComponentType<{ children: ReactNode }> = ReOrderableItem;
export const ReorderableList: ComponentType<{ children: ReactNode, list: any[], onListUpdate: (newList: any[]) => void, style: CSSProperties }> = ReOrderableList;