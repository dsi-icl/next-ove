import React from "react";
import { useVideoStreams } from "./hooks";
// TODO: investigate circular dependency
// eslint-disable-next-line @nx/enforce-module-boundaries
import { VideoStreams } from "@ove/ui-components";

const LiveView = () => {
  const streams = useVideoStreams();
  return <VideoStreams streams={streams} />;
};

export default LiveView;
