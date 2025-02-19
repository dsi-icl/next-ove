import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ove/ui-base-components";
import { Video } from "lucide-react";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../env";
import { api } from "../../../../utils/api";
import { VideoStreams } from "@ove/ui-components";
import React, { memo, useEffect, useState } from "react";

const useStreams = (bridgeId: string, isOpen: boolean) => {
  const streams = api.bridge.getStreams.useQuery({ bridgeId });
  const startStreams = api.bridge.startStreams.useMutation({ retry: false });
  const stopStreams = api.bridge.stopStreams.useMutation({ retry: false });

  useEffect(() => {
    if (isOpen) {
      startStreams.mutateAsync({ bridgeId }).catch(logger.error);
    } else {
      stopStreams.mutateAsync({ bridgeId }).catch(logger.error);
    }
  }, [isOpen, bridgeId]);

  return streams;
};

const LiveFeed = memo(({ bridgeId }: { bridgeId: string }) => {
  const [open, setOpen] = useState(false);
  const streams = useStreams(bridgeId, open);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Video className="mr-2 size-4" />
          Live Feed
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-[unset]">
        <DialogHeader>
          <DialogTitle>Observatory Live Feed</DialogTitle>
          <DialogDescription>Live camera feed of observatory</DialogDescription>
        </DialogHeader>
        <div className="h-[80vh]">
          {streams.status === "success" && !isError(streams.data.response) ? (
            <VideoStreams streams={streams.data.response} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
});
LiveFeed.displayName = "LiveFeed";

export default LiveFeed;
