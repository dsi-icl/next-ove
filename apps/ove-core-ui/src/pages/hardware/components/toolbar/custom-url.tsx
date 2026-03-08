import React, { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../utils/api";
import { Globe, RotateCcw } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from "@ove/ui-base-components";
import { DEFAULT_BROWSER_CONFIG } from "../../default-browser-config";
import type { Bounds } from "@ove/ove-types";

const groupDisplaysByDevice = (
  displays: Bounds["displays"],
): Record<string, { displayId: number; row: number; column: number }[]> =>
  displays.reduce(
    (acc, display) => {
      if (!(display.deviceId in acc)) {
        acc[display.deviceId] = [];
      }
      acc[display.deviceId].push({
        displayId: display.displayId,
        row: display.row,
        column: display.column,
      });
      return acc;
    },
    {} as Record<
      string,
      { displayId: number; row: number; column: number }[]
    >,
  );

const buildDeviceConfig = (
  baseUrl: string,
  displays: { displayId: number; row: number; column: number }[],
): string[] => {
  const sorted = [...displays].sort((a, b) => a.displayId - b.displayId);
  const separator = baseUrl.includes("?") ? "&" : "?";
  return sorted.map(
    ({ row, column }) => `${baseUrl}${separator}r=${row - 1}&c=${column - 1}`,
  );
};

const CustomUrl = ({ bridgeId }: { bridgeId: string }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const bounds = api.core.getObservatoryBounds.useQuery();
  const setBrowserConfig = api.hardware.setBrowserConfig.useMutation({
    retry: false,
  });

  const geometry = useMemo(() => {
    if (bounds.status !== "success" || !(bridgeId in bounds.data)) return null;
    return bounds.data[bridgeId];
  }, [bounds.status, bounds.data, bridgeId]);

  const applyCustomUrl = useCallback(async () => {
    if (geometry === null || url.trim() === "") {
      toast.error("No geometry data or URL provided");
      return;
    }

    setIsApplying(true);
    const grouped = groupDisplaysByDevice(geometry.displays);
    const configPromises = Object.entries(grouped).map(
      ([deviceId, displays]) =>
        setBrowserConfig
          .mutateAsync({
            bridgeId,
            deviceId,
            config: buildDeviceConfig(url.trim(), displays),
          })
          .then(() => ({ deviceId, status: "success" as const }))
          .catch(() => ({ deviceId, status: "error" as const })),
    );

    toast.promise(
      Promise.all(configPromises).then((results) => {
        const failed = results.filter((r) => r.status === "error");
        if (failed.length > 0) {
          throw new Error(
            `Failed on: ${failed.map((f) => f.deviceId).join(", ")}`,
          );
        }
        return results;
      }),
      {
        loading: "Applying custom URL to all screens...",
        success: "Config updated. Close and reopen browsers to apply.",
        error: (err) => err.message,
      },
    );

    setIsApplying(false);
    setOpen(false);
  }, [geometry, url, bridgeId, setBrowserConfig]);

  const resetToDefault = useCallback(async () => {
    setIsApplying(true);
    const configPromises = Object.entries(DEFAULT_BROWSER_CONFIG).map(
      ([deviceId, config]) =>
        setBrowserConfig
          .mutateAsync({ bridgeId, deviceId, config: [...config] })
          .then(() => ({ deviceId, status: "success" as const }))
          .catch(() => ({ deviceId, status: "error" as const })),
    );

    toast.promise(
      Promise.all(configPromises).then((results) => {
        const failed = results.filter((r) => r.status === "error");
        if (failed.length > 0) {
          throw new Error(
            `Failed on: ${failed.map((f) => f.deviceId).join(", ")}`,
          );
        }
        return results;
      }),
      {
        loading: "Resetting to default URLs...",
        success: "Config reset. Close and reopen browsers to apply.",
        error: (err) => err.message,
      },
    );

    setIsApplying(false);
    setOpen(false);
  }, [bridgeId, setBrowserConfig]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Globe className="mr-2 size-4" />
          Custom URL
        </Button>
      </DialogTrigger>
      <DialogContent className="flex w-[500px] flex-col">
        <DialogHeader>
          <DialogTitle>Custom URL</DialogTitle>
          <DialogDescription>
            Apply a custom URL to all screens. Row and column parameters will be
            appended automatically based on screen position.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="https://example.com/page"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Each screen will receive: {url || "https://example.com"}
            {url.includes("?") ? "&" : "?"}r=ROW&c=COL
          </p>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={isApplying || url.trim() === ""}
              onClick={applyCustomUrl}
            >
              <Globe className="mr-2 size-4" />
              Apply to All
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={isApplying}
              onClick={resetToDefault}
            >
              <RotateCcw className="mr-2 size-4" />
              Reset to Default
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomUrl;
