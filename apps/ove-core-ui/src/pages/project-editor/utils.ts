import { type Project, type Section } from "@prisma/client";
import { DataType } from "./types";

export const toProject = (project: Project, sections: Section[]) => {
  console.log(JSON.stringify({
    ...project,
    layout: sections
  }, undefined, 2));
};

export const dataTypes: DataType[] = [
  {
    name: "videos",
    displayName: "Video",
    color: "#FA9E78",
    extensions: [".mp4", ".ogv", ".webm", ".otv"]
  },
  {
    name: "images",
    displayName: "Image",
    color: "#FDEBDC",
    extensions: [".dzi", ".png", ".jpg", ".jpeg"]
  },
  {
    name: "svg",
    displayName: "SVG",
    color: "#689A9B",
    extensions: [".svg"]
  },
  {
    name: "audio",
    displayName: "Audio",
    color: "#657373",
    extensions: [".mp3", ".wav", ".ogg"]
  },
  {
    name: "html",
    displayName: "HTML",
    color: "#CFD6D6",
    extensions: [".html"]
  },
  {
    name: "latex",
    displayName: "LaTeX",
    color: "#CDC1DC",
    extensions: [".tex"]
  },
  {
    name: "markdown",
    displayName: "Markdown",
    color: "#7F1D33",
    extensions: [".md"]
  },
  {
    name: "json",
    displayName: "JSON",
    color: "#A92743",
    extensions: [".json"]
  },
  {
    name: "data-table",
    displayName: "Data Table (CSV)",
    color: "#664C83",
    extensions: [".csv"]
  }
];

export const actionColors = ["#ef476f", "#f78c6b", "#ffd166", "#06d6a0", "#118ab2", "#002147", "#FA9E78", "#FDEBDC", "#6B9A9B"];
