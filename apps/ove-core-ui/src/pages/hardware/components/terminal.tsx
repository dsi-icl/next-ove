import {
  DialogClose,
  DialogContent, DialogFooter,
  DialogHeader, Input
} from "@ove/ui-base-components";
import { DialogTitle } from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFormErrorHandling } from "@ove/ui-components";
import { api } from "../../../utils/api";
import { isError } from "@ove/ove-types";
import { toast } from "sonner";
import { logger } from "../../../env";

const useConsole = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const addCommand = useCallback((command: string) => {
    setCommandHistory(cur => [...cur, command]);
  }, [setCommandHistory]);
  const execute = api.hardware.execute.useMutation({
    onSuccess: ({ response }) => {
      if (isError(response)) {
        addCommand(`${deviceId} > ERROR`);
        return;
      }

      addCommand(`${response.response}`);
    },
    onError: () => toast.error("Unable to execute command")
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
    onError: () => addCommand(`${bridgeId} > ERROR`)
  });

  if (deviceId === null) {
    return {
      execute: ({ command, reset }: { command: string, reset: () => void }) => {
        addCommand(`${deviceId ?? bridgeId}:~$ ${command}`);
        executeAll.mutateAsync({
          bridgeId,
          command,
          tag
        }).catch(logger.error);
        reset();
      },
      fetching: executeAll.status === "pending",
      commandHistory: commandHistory.map(formatCommand)
    };
  }

  return {
    execute: ({ command, reset }: { command: string, reset: () => void }) => {
      addCommand(`${deviceId ?? bridgeId}:~$ ${command}`);
      execute.mutateAsync({
        bridgeId,
        deviceId,
        command
      }).catch(logger.error);
      reset();
    },
    fetching: execute.status === "pending",
    commandHistory: commandHistory.map(formatCommand)
  };
};

type TerminalProps = {
  deviceId: string | null
  bridgeId: string
  tag: string | undefined
}

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

const Terminal = ({ deviceId, bridgeId, tag }: TerminalProps) => {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<typeof TerminalSchema>>({
    resolver: zodResolver(TerminalSchema)
  });
  useFormErrorHandling(errors);
  const {
    execute,
    fetching,
    commandHistory
  } = useConsole(bridgeId, deviceId, tag);

  const addCommand = ({ command }: z.infer<typeof TerminalSchema>) => {
    execute({ command, reset });
  };

  return <DialogContent className="p-0 rounded" hasClose={false}>
    <DialogHeader
      className="bg-gray-100 flex-row p-2 space-y-0 rounded border-b border-gray-200 font-semibold">
      <DialogTitle>Terminal - {deviceId ?? bridgeId}</DialogTitle>
      <DialogClose className="ml-auto flex flex-row items-center h-full mt-0">
        <X className="h-4 w-4 mt-0" />
      </DialogClose>
    </DialogHeader>
    <div className="h-[40vh] overflow-y-scroll">
      {commandHistory.map(([prefix, separator, command]) =>
        <div className="ml-2 flex">
          <p className="h-full font-semibold">{prefix}</p>
          <p
            className={["font-semibold", separator !== ">" ? undefined : "ml-2"].join(" ")}>{separator}</p>
          <p className={prefix === "" ? undefined : "ml-2"}>{command}</p>
        </div>)}
      {!fetching ? <div className="flex items-center ml-2">
        <p className="h-full font-semibold">{deviceId ?? bridgeId}:~$</p>
        <p className="bg-gray-400 w-2 h-5 ml-2">&nbsp;</p>
      </div> : null}
    </div>
    <DialogFooter className="bg-gray-100 border-t border-gray-200">
      <form onSubmit={handleSubmit(addCommand)} className="w-full m-2">
        <Input {...register("command")} />
      </form>
    </DialogFooter>
  </DialogContent>;
};

export default Terminal;
