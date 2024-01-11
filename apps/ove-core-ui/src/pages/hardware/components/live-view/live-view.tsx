import React from "react";
import { useStreams } from "./hooks";
import { isError } from "@ove/ove-types";
import { VideoStreams } from "@ove/ui-components";

type LiveViewProps = {
  bridgeId: string
  isOpen: boolean
}

const LiveView = ({ bridgeId, isOpen }: LiveViewProps) => {
  const streams = useStreams(bridgeId, isOpen);

  return streams.status === "success" && !isError(streams.data.response) ?
    <VideoStreams streams={streams.data.response} /> : null;
};

export default LiveView;
