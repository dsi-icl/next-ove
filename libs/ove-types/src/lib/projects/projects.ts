import { z } from "zod";

export const FileSchema = z.strictObject({
  bucketName: z.string(),
  name: z.string(),
  version: z.string(),
  isGlobal: z.boolean(),
  isLatest: z.boolean()
});

export type File = z.infer<typeof FileSchema>

export const DataTypesSchema = z.union([
  z.literal("videos"),
  z.literal("images"),
  z.literal("svg"),
  z.literal("audio"),
  z.literal("html"),
  z.literal("latex"),
  z.literal("json"),
  z.literal("geojson"),
  z.literal("markdown"),
  z.literal("data-table")
]);

export type DataTypes = z.infer<typeof DataTypesSchema>

export type DataType = {
  name: DataTypes
  displayName: string
  color: string
  extensions: string[]
  requiresFormatting: boolean
}

export const dataTypes: DataType[] = [
  {
    name: "videos",
    displayName: "Video",
    color: "#FA9E78",
    extensions: [".mp4", ".ogv", ".webm", ".otv"],
    requiresFormatting: false
  },
  {
    name: "images",
    displayName: "Image",
    color: "#FDEBDC",
    extensions: [".dzi", ".png", ".jpg", ".jpeg"],
    requiresFormatting: false
  },
  {
    name: "audio",
    displayName: "Audio",
    color: "#657373",
    extensions: [".mp3", ".wav", ".ogg"],
    requiresFormatting: false
  },
  {
    name: "html",
    displayName: "HTML",
    color: "#CFD6D6",
    extensions: [".html", ".gif", ".svg"],
    requiresFormatting: false
  },
  {
    name: "latex",
    displayName: "LaTeX",
    color: "#CDC1DC",
    extensions: [".tex"],
    requiresFormatting: true
  },
  {
    name: "markdown",
    displayName: "Markdown",
    color: "#7F1D33",
    extensions: [".md"],
    requiresFormatting: true
  },
  {
    name: "json",
    displayName: "JSON",
    color: "#A92743",
    extensions: [".json"],
    requiresFormatting: true
  },
  {
    name: "geojson",
    displayName: "GeoJSON",
    color: "red",
    extensions: [".json"],
    requiresFormatting: true
  },
  {
    name: "data-table",
    displayName: "Data Table",
    color: "#664C83",
    extensions: [".csv", ".tsv"],
    requiresFormatting: true
  }
];
