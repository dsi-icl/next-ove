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
import { api } from "../../../../utils/api";
import React, { memo, useCallback, useState } from "react";

const LiveFeed = memo(({ bridgeId }: { bridgeId: string }) => {
  const [open, setOpen] = useState(false);
  const context = api.useUtils();
  const getStatus = api.bridge.getStreamStatus.useQuery({ bridgeId });
  const streams = api.bridge.getStreams.useQuery({ bridgeId });
  const startStreams = api.bridge.startStreams.useMutation({
    retry: false,
    onSuccess: () => {
      toast.promise(
        async () => {
          await context.bridge.getStreamStatus.invalidate({ bridgeId });
          await context.bridge.getStreams.invalidate({ bridgeId });
        },
        {
          loading: "Updating stream status...",
          success: "Successfully updated stream status",
          error: "Unable to update stream status",
        },
      );
    },
  });
  const stopStreams = api.bridge.stopStreams.useMutation({
    retry: false,
    onSuccess: () => {
      toast.promise(
        async () => {
          await context.bridge.getStreamStatus.invalidate({ bridgeId });
          await context.bridge.getStreams.invalidate({ bridgeId });
        },
        {
          loading: "Updating stream status...",
          success: "Successfully updated stream status",
          error: "Unable to update stream status",
        },
      );
    },
  });

  const start = useCallback(() => {
    toast.promise(startStreams.mutateAsync({ bridgeId }), {
      loading: "Starting live feed...",
      success: "Successfully started live feed",
      error: "Unable to start live feed",
    });
  }, [startStreams, bridgeId]);

  const stop = useCallback(() => {
    toast.promise(stopStreams.mutateAsync({ bridgeId }), {
      loading: "Stopping live feed...",
      success: "Successfully stopped live feed",
      error: "Unable to stop live feed",
    });
  }, [stopStreams, bridgeId]);

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
        <div className="flex h-[80vh] flex-col">
          {streams.status === "success" ? (
            <Carousel className="ml-8 h-[calc(100%-2.5rem)] w-[calc(100%-4rem)]">
              <CarouselContent>
                {streams.data?.map((stream, i) => (
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
          {getStatus.status === "success" ? (
            <Button
              className="ml-auto"
              variant={getStatus.data ? "destructive" : "default"}
              onClick={getStatus.data ? stop : start}
            >
              {getStatus.data ? "Stop" : "Start"}
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
});
LiveFeed.displayName = "LiveFeed";

export default LiveFeed;
