import { useObservatory } from "../../../hooks/observatories";
import { DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@ove/ui-base-components";
import { useSections } from "../hooks/sections";
import { useStateStore } from "../hooks/stores";
import type { Section } from ".prisma/client";
import { formatState } from "../hooks/states";
import { api } from "../../../utils/api";
import { useMemo } from "react";

const getContent = (section: Section) => {
  const file = useMemo(() => {
    const parsed = /^\/store\/(.+)\/(.+)\?versionId=(.+)$/.exec(section.asset);
    if (parsed === null || parsed.length !== 4) return null;
    return parsed.length !== 4 ? null : {bucketName: parsed[1], name: parsed[2],version: parsed[3]};
  }, [section.asset]);
  const getURL = api.projects.getPresignedGetURL.useQuery({
    bucketName: file?.bucketName ?? "ERROR",
    objectName: file?.name ?? "ERROR",
    versionId: file?.version ?? "ERROR",
  }, {enabled: file !== null});

  const url = useMemo(() => {
    if (file === null) return section.asset;
    if (getURL.status !== "success") return undefined;
    return getURL.data;
  }, [file, getURL.status, getURL.data, section.asset]);

  switch (section.dataType) {
    case "html": return <iframe key={section.id}
                                className="absolute bg-red-500/30"
                                style={{
                                  left: `${section.x * 100}%`,
                                  top: `${section.y * 100}%`,
                                  width: `${section.width * 100}%`,
                                  height: `${section.height * 100}%`,
                                }} src={url}></iframe>
    case "images": return <img key={section.id}
                               className="absolute bg-red-500/30"
                               style={{
                                 left: `${section.x * 100}%`,
                                 top: `${section.y * 100}%`,
                                 width: `${section.width * 100}%`,
                                 height: `${section.height * 100}%`,
                               }} src={url} alt="Section image" />
    case "videos": return <video key={section.id}
                               className="absolute bg-red-500/30"
                               style={{
                                 left: `${section.x * 100}%`,
                                 top: `${section.y * 100}%`,
                                 width: `${section.width * 100}%`,
                                 height: `${section.height * 100}%`,
                               }} src={url} />
    default: return <div key={section.id}
      className="absolute bg-red-500/30"
      style={{
      left: `${section.x * 100}%`,
        top: `${section.y * 100}%`,
        width: `${section.width * 100}%`,
        height: `${section.height * 100}%`,
    }}></div>
  }
};

const Preview = () => {
  const selected = useStateStore((store) => store.selectedState);
  const { getSections } = useSections();
  const { bounds } = useObservatory();
  return bounds !== null ? <DialogContent className="w-[90vw] max-w-[unset]">
    <DialogHeader>
      <DialogTitle>Preview - {formatState(selected)}</DialogTitle>
      <DialogDescription>Preview of asset layout for the current state</DialogDescription>
    </DialogHeader>
    <div
    className="relative top-0 left-0 grid border border-gray-800 overflow-hidden w-full"
    style={{
      aspectRatio: `${bounds.width} / ${bounds.height}`,
      gridTemplateColumns: `repeat(${bounds.columns}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${bounds.rows}, minmax(0, 1fr))`,
    }}
  >
    {Array.from({ length: bounds.columns * bounds.rows }).map((_, idx) => (
      <div
        key={idx}
        className="box-border border border-gray-300 bg-gray-200/20"
      />
    ))}

    {getSections(selected).map(getContent)}
  </div></DialogContent> : null
};

export default Preview;
