import { useVideoStreams } from "./hooks";
import { VideoStreams } from "@ove/ui-components";

const LiveView = () => {
  const streams = useVideoStreams();
  return <VideoStreams streams={streams} />
};

export default LiveView;