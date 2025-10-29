import { toast } from "sonner";
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ove/ui-base-components";
import { Video } from "lucide-react";
import { isError } from "@ove/ove-types";
import { api } from "../../../../utils/api";
import React, { memo, useState } from "react";

const LiveFeed = memo(({ bridgeId }: { bridgeId: string }) => {
  const [open, setOpen] = useState(false);
  const context = api.useUtils();
  const getStatus = api.bridge.getStreamStatus.useQuery({ bridgeId });
  const streams = api.bridge.getStreams.useQuery({ bridgeId });
  const startStreams = api.bridge.startStreams.useMutation({
    retry: false,
    onSuccess: () => context.bridge.getStreamStatus.invalidate({ bridgeId }),
  });
  const stopStreams = api.bridge.stopStreams.useMutation({
    retry: false,
    onSuccess: () => context.bridge.getStreamStatus.invalidate({ bridgeId }),
  });

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
        <div className="h-[80vh] flex flex-col">
          {streams.status === "success" && !isError(streams.data.response) ? (
            <Carousel className="ml-8 h-[calc(100%-2.5rem)] w-[calc(100%-4rem)]">
              <CarouselContent>
                {streams.data.response?.map((stream, i) => (
                  <CarouselItem
                    key={stream}
                    className="flex w-full items-center justify-center"
                  >
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
          {getStatus.status === "success" &&
          !isError(getStatus.data.response) ? (
            <Button
              className="ml-auto"
              variant={getStatus.data.response ? "destructive" : "default"}
              onClick={() => {
                (getStatus.data.response ? stopStreams : startStreams)
                  .mutateAsync({ bridgeId })
                  .then(() =>
                    toast.success(
                      `Successfully ${getStatus.data.response ? "stopped" : "started"} live feed`,
                    ),
                  )
                  .catch(() =>
                    toast.error(
                      `Unable to ${getStatus.data.response ? "stop" : "start"} live feed`,
                    ),
                  );
              }}
            >
              {getStatus.data.response ? "Stop" : "Start"}
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
});
LiveFeed.displayName = "LiveFeed";

export default LiveFeed;
