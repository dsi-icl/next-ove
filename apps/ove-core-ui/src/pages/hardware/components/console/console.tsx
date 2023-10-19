import { useForm } from "react-hook-form";
import { useStore } from "../../../../store";
import { useCallback, useEffect } from "react";
import { ChevronRight, SendHorizontal } from "lucide-react";

import styles from "./console.module.scss";

const Line = ({ text, consoleId }: { text: string, consoleId: string }) => {
  return <li>
    {text.startsWith(consoleId) ? <ChevronRight size="0.8rem" /> : null}
    <p>{text}</p>
  </li>;
};

const Console = ({ consoleId, isOpen }: {
  consoleId: string,
  isOpen: boolean
}) => {
  const commandHistory = useStore(state => state.hardwareConfig.commandHistory);
  const setCommand = useStore(state => state.hardwareConfig.setCommand);
  const addCommand = useStore(state => state.hardwareConfig.addCommandHistory);
  const { register, reset, handleSubmit } = useForm<{ command: string }>();

  const onSubmit = useCallback(({ command }: { command: string }) => {
    setCommand(command);
    addCommand(`${consoleId} ~ ${command}`);
  }, [setCommand, consoleId, addCommand]);

  useEffect(() => {
    reset();
  }, [isOpen]);

  return <div className={styles.console}>
    <h4>Console - {consoleId}</h4>
    <ul>
      {commandHistory.map((line, i) => <Line key={`${line}-${i}`}
                                             consoleId={consoleId}
                                             text={line} />)}
    </ul>
    <form onSubmit={handleSubmit(onSubmit)}>
      <p><span>$</span>{consoleId} ~ </p>
      <input {...register("command", { required: true })} autoComplete="off"
             type="text" />
      <button type="submit"><SendHorizontal /></button>
    </form>
  </div>;
};

export default Console;