import { useStreams } from "./hooks";
import { isError } from "@ove/ove-types";
import { VideoStreams } from "@ove/ui-components";

const LiveView = ({ bridgeId }: { bridgeId: string }) => {
  const streams = useStreams(bridgeId);

  return streams.status === "success" && !isError(streams.data.response) ?
    <VideoStreams streams={streams.data.response} /> : null;
};

export default LiveView;
