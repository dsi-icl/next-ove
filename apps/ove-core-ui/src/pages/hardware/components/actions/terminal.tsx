import { z } from "zod";
import { toast } from "sonner";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  Input,
  useFormErrorHandling,
} from "@ove/ui-base-components";
import { X } from "lucide-react";
import { logger } from "../../../../env";
import { api } from "../../../../utils/api";
import { isError } from "@ove/ove-types";
import { useForm } from "react-hook-form";
import { DialogTitle } from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import React, { useCallback, useEffect, useRef, useState } from "react";

const useConsole = (
  bridgeId: string,
  deviceId: string | null,
  tags?: string[],
  deviceIds?: string[]
) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const addCommand = useCallback(
    (command: string) => {
      setCommandHistory((cur) => [...cur, command]);
    },
    [setCommandHistory],
  );
  const execute = api.hardware.execute.useMutation({
    onSuccess: ({ response }) => {
      if (isError(response)) {
        addCommand(`${deviceId} > ERROR`);
        return;
      }

      addCommand(`${response.response}`);
    },
    onError: () => toast.error("Unable to execute command"),
  });
  const executeAll = api.hardware.executeAll.useMutation({
    onSuccess: ({ response }) => {
      if (isError(response)) {
        addCommand(`${bridgeId} > ERROR`);
        return;
      }

      response.forEach(({ deviceId, response }) => {
        if ("response" in response) {
          addCommand(`${deviceId} > ${response.response}`);
        } else {
          addCommand(`${deviceId} > ERROR`);
        }
      });
    },
    onError: () => addCommand(`${bridgeId} > ERROR`),
  });

  if (deviceId === null) {
    return {
      execute: ({ command, reset }: { command: string; reset: () => void }) => {
        addCommand(`${deviceId ?? bridgeId}:~$ ${command}`);
        executeAll
          .mutateAsync({
            bridgeId,
            command,
            tags,
            deviceIds,
          })
          .catch(logger.error);
        reset();
      },
      fetching: executeAll.status === "pending",
      commandHistory: commandHistory.map(formatCommand),
    };
  }

  return {
    execute: ({ command, reset }: { command: string; reset: () => void }) => {
      addCommand(`${deviceId ?? bridgeId}:~$ ${command}`);
      execute
        .mutateAsync({
          bridgeId,
          deviceId,
          command,
        })
        .catch(logger.error);
      reset();
    },
    fetching: execute.status === "pending",
    commandHistory: commandHistory.map(formatCommand),
  };
};

type TerminalProps = {
  deviceId: string | null;
  bridgeId: string;
  tags?: string[];
  deviceIds?: string[];
};

const formatCommand = (cmd: string) => {
  if (cmd.includes(">")) {
    const [prefix, command] = cmd.split(">");
    return [`${prefix}`, ">", command];
  } else if (cmd.includes("$")) {
    const [prefix, command] = cmd.split("$");
    return [`${prefix}`, "$", command];
  }
  return ["", "", cmd];
};

const TerminalSchema = z.strictObject({ command: z.string() });

const Terminal = ({ deviceId, bridgeId, tags, deviceIds }: TerminalProps) => {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof TerminalSchema>>({
    resolver: zodResolver(TerminalSchema),
  });
  useFormErrorHandling(errors);
  const { execute, fetching, commandHistory } = useConsole(
    bridgeId,
    deviceId,
    tags,
    deviceIds,
  );
  const historyRef = useRef<HTMLDivElement>(null);

  const addCommand = ({ command }: z.infer<typeof TerminalSchema>) => {
    execute({ command, reset });
  };

  useEffect(() => {
    historyRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [commandHistory]);

  return (
    <DialogContent className="rounded p-0" hasClose={false}>
      <DialogHeader className="flex-row space-y-0 rounded border-b border-gray-200 bg-gray-100 p-2 font-semibold">
        <DialogTitle>Terminal - {deviceId ?? bridgeId}</DialogTitle>
        <DialogClose className="ml-auto mt-0 flex h-full flex-row items-center">
          <X className="mt-0 size-4" />
        </DialogClose>
        <VisuallyHidden asChild>
          <DialogDescription>Terminal for remote control</DialogDescription>
        </VisuallyHidden>
      </DialogHeader>
      <div className="h-[40vh] overflow-y-scroll">
        {commandHistory.map(([prefix, separator, command], i) => (
          <div
            className="ml-2 flex"
            key={`${prefix}${separator}${command}${i}`}
          >
            <p className="h-full font-semibold">{prefix}</p>
            <p
              className={[
                "font-semibold",
                separator !== ">" ? undefined : "ml-2",
              ].join(" ")}
            >
              {separator}
            </p>
            <p className={prefix === "" ? undefined : "ml-2"}>{command}</p>
          </div>
        ))}
        {!fetching ? (
          <div className="ml-2 flex items-center">
            <p className="h-full font-semibold">{deviceId ?? bridgeId}:~$</p>
            <p className="ml-2 h-5 w-2 bg-gray-400">&nbsp;</p>
          </div>
        ) : null}
        <div ref={historyRef}></div>
      </div>
      <DialogFooter className="border-t border-gray-200 bg-gray-100">
        <form onSubmit={handleSubmit(addCommand)} className="m-2 w-full">
          <Input {...register("command")} />
        </form>
      </DialogFooter>
    </DialogContent>
  );
};

export default Terminal;
