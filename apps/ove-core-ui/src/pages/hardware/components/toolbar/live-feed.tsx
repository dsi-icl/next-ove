import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@ove/ui-base-components";
import { Video } from "lucide-react";
import { isError } from "@ove/ove-types";
import { logger } from "../../../../env";
import { api } from "../../../../utils/api";
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
            <Carousel className="h-full w-[calc(100%-4rem)] ml-8">
              <CarouselContent>
                {streams.data.response?.map((stream, i) => (
                  <CarouselItem key={stream} className="flex items-center w-full justify-center">
                    <iframe
                      className="aspect-video max-h-[calc(90vh-8rem)]"
                      src={stream}
                      title={`CAMERA-${i}`}
                    ></iframe>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
});
LiveFeed.displayName = "LiveFeed";

export default LiveFeed;
