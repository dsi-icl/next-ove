import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  type FocusEvent,
  type ReactNode,
} from "react";
import { z } from "zod";
import {
  formatState,
  useRemoveState,
  useStates,
  useUpdateState,
} from "../hooks/states";
import { env } from "../../../env";
import { X } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { useStateStore } from "../hooks/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn, useFormErrorHandling } from "@ove/ui-base-components";

const TitleFormSchema = z.strictObject({ name: z.string() });

type TitleForm = z.infer<typeof TitleFormSchema>;

const StateTabs = () => {
  const states = useStates();
  const selected = useStateStore((state) => state.selectedState);
  const [isEditing, setIsEditing] = useState(false);
  const updateState = useUpdateState();

  const onSubmit = useCallback(
    ({ name }: TitleForm) => {
      if (states.includes(name) || name === "") return;
      setIsEditing(false);
      updateState(selected, name);
    },
    [setIsEditing, states, updateState, selected],
  );

  return (
    <nav className="h-8 overflow-x-scroll border-b border-solid border-[#dadedf] no-scrollbar">
      <ul className="flex items-start gap-1 overflow-x-scroll p-1">
        <DefaultTab
          key="default-tab"
          isSelected={env.CONSTANTS.DEFAULT_STATE === selected}
        />
        {states.map((state) =>
          state !== env.CONSTANTS.DEFAULT_STATE ? (
            <Tab
              isBeingEdited={isEditing && selected === state}
              isSelected={selected === state}
              editTab={() => setIsEditing(true)}
              key={state}
              state={state}
              stopEditingTab={() => setIsEditing(false)}
              isEditing={isEditing}
              onSubmit={onSubmit}
            />
          ) : null,
        )}
        <AddTab key="add-tab" />
      </ul>
    </nav>
  );
};

type TabProps = {
  state: string;
  isBeingEdited: boolean;
  isSelected: boolean;
  editTab: () => void;
  stopEditingTab: () => void;
  isEditing: boolean;
  onSubmit: (title: TitleForm) => void;
};

const Tab = ({
  isBeingEdited,
  isSelected,
  isEditing,
  onSubmit,
  editTab,
  stopEditingTab,
  state,
}: TabProps) => {
  const title = useMemo(() => formatState(state), [state]);
  const width = isBeingEdited ? "100%" : `calc(${title.length}ch + 1rem)`;
  return (
    <li
      style={{ width: `calc(${width} + 2rem)` }}
      className="relative grow basis-0 rounded bg-[#dadedf] text-center"
    >
      <TabContent
        isBeingEdited={isBeingEdited}
        state={state}
        isSelected={isSelected}
        stopEditing={stopEditingTab}
        startEditing={editTab}
      >
        {isBeingEdited ? (
          <EditTab onSubmit={onSubmit} />
        ) : (
          <p className="mr-6 whitespace-nowrap" style={{ width }}>
            {title}
          </p>
        )}
      </TabContent>
      <RemoveTab state={state} isEditing={isEditing} />
    </li>
  );
};

const DefaultTab = ({ isSelected }: { isSelected: boolean }) => {
  const setState = useStateStore((state) => state.setSelectedState);

  return (
    <li
      className={cn(
        "relative min-w-[calc(1ch+2rem)] max-w-[calc(1ch+2rem)] rounded bg-[#dadedf] text-center",
        isSelected ? "font-bold" : undefined,
      )}
    >
      <button
        onClick={() => setState(env.CONSTANTS.DEFAULT_STATE)}
        className="w-full"
      >
        *
      </button>
    </li>
  );
};

type TabContentProps = {
  children: ReactNode;
  isSelected: boolean;
  isBeingEdited: boolean;
  stopEditing: () => void;
  startEditing: () => void;
  state: string;
};

const TabContent = ({
  children,
  state,
  startEditing,
  stopEditing,
  isBeingEdited,
  isSelected,
}: TabContentProps) => {
  const setState = useStateStore((state) => state.setSelectedState);

  const onBlur = useCallback(
    (e: FocusEvent<HTMLButtonElement>) => {
      if (e.relatedTarget !== null) return;
      stopEditing();
    },
    [stopEditing],
  );

  return (
    <button
      className={cn("relative", isSelected ? "font-bold" : undefined)}
      onClick={isBeingEdited ? undefined : () => setState(state)}
      onBlur={onBlur}
      onDoubleClick={startEditing}
    >
      {children}
    </button>
  );
};

type EditTabProps = {
  onSubmit: (title: TitleForm) => void;
};

const EditTab = ({ onSubmit }: EditTabProps) => {
  const {
    register,
    resetField,
    handleSubmit,
    formState: { errors },
  } = useForm<TitleForm>({
    resolver: zodResolver(TitleFormSchema),
  });
  useFormErrorHandling(errors);

  useEffect(() => () => resetField("name"), [resetField]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        className="w-full"
        {...register("name", { required: true })}
        autoFocus={true}
      />
      <input type="submit" className="hidden w-full" />
    </form>
  );
};

const AddTab = () => {
  const addState = useStateStore((state) => state.addState);
  const ref = useRef<HTMLButtonElement | null>(null);

  const onClick = useCallback(() => {
    addState();
    setTimeout(
      () => ref.current?.scrollIntoView({ behavior: "smooth" }),
      env.CONSTANTS.STATE_TAB_TRANSITION,
    );
  }, [addState]);

  return (
    <li className="relative flex-initial rounded bg-[#dadedf] text-center">
      <button className="px-2" ref={ref} onClick={onClick}>
        +
      </button>
    </li>
  );
};

type RemoveTabProps = {
  state: string;
  isEditing: boolean;
};

const RemoveTab = ({ isEditing, state }: RemoveTabProps) => {
  const removeState = useRemoveState();

  return isEditing ? null : (
    <button
      className="absolute right-1 top-[calc(50%-0.55rem)] h-[1.1rem] w-fit"
      onClick={() => removeState(state)}
    >
      <X />
    </button>
  );
};

export default StateTabs;
