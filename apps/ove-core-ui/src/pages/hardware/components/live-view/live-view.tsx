import { VideoStreams } from "@ove/ui-components";
import { isError } from "@ove/ove-types";
import { useStreams } from "./hooks";

const LiveView = ({ bridgeId, isOpen }: { bridgeId: string, isOpen: boolean }) => {
  const streams = useStreams(bridgeId, isOpen);

  return streams.status === "success" && !isError(streams.data.response) ?
    <VideoStreams streams={streams.data.response} /> : null;
};

export default LiveView;
