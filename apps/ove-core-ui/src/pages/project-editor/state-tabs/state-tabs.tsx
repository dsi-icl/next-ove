import React, {
  type ReactNode,
  type FocusEvent,
  useEffect,
  useState,
  useRef
} from "react";
import { z } from "zod";
import { X } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormErrorHandling } from "@ove/ui-components";

import styles from "./state-tabs.module.scss";

type StateTabsProps = {
  selected: string
  states: string[]
  setState: (state: string) => void
  removeState: (state: string) => void
  formatState: (state: string) => string
  updateState: (state: string, name: string) => void
  addState: () => void
}

const DEFAULT_STATE = "__default__";

const TitleFormSchema = z.strictObject({ name: z.string() });

type TitleForm = z.infer<typeof TitleFormSchema>

const StateTabs = ({
  selected,
  removeState,
  states,
  setState,
  formatState,
  updateState,
  addState
}: StateTabsProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const onSubmit = ({ name }: TitleForm) => {
    if (states.includes(name) || name === "") return;
    setIsEditing(false);
    updateState(selected, name);
  };

  return <nav className={styles.container}>
    <ul className={styles.tabs}>
      <DefaultTab key="default-tab" isSelected={DEFAULT_STATE === selected}
                  updateState={() => setState(DEFAULT_STATE)} />
      {[...states].sort().map(state => {
        if (state === DEFAULT_STATE) return null;
        const isSelected = selected === state;
        const isBeingEdited = isEditing && isSelected;
        const formatted = formatState(state);
        return <Tab title={formatted} isBeingEdited={isBeingEdited}
                    isSelected={isSelected} updateState={() => setState(state)}
                    editTab={() => setIsEditing(true)} key={state}
                    stopEditingTab={() => setIsEditing(false)}
                    isEditing={isEditing} onSubmit={onSubmit}
                    removeState={() => removeState(state)} />;
      })}
      <AddTab key="add-tab" addState={addState} />
    </ul>
  </nav>;
};

type TabProps = {
  title: string
  isBeingEdited: boolean
  isSelected: boolean
  updateState: () => void
  editTab: () => void
  stopEditingTab: () => void
  isEditing: boolean
  onSubmit: (title: TitleForm) => void
  removeState: () => void
}

const Tab = ({
  title,
  isBeingEdited,
  isSelected,
  isEditing,
  updateState,
  onSubmit,
  editTab,
  stopEditingTab,
  removeState
}: TabProps) => {
  const width = isBeingEdited ? "100%" : `calc(${title.length}ch + 1rem)`;
  return <li style={{ width: `calc(${width} + 2rem)` }} className={styles.tab}>
    <TabContent updateState={updateState} isBeingEdited={isBeingEdited}
                isSelected={isSelected} stopEditing={stopEditingTab}
                startEditing={editTab}>
      {isBeingEdited ?
        <EditTab onSubmit={onSubmit} /> :
        <p className={styles.title} style={{ width }}>{title}</p>}
    </TabContent>
    <RemoveTab removeState={removeState} isEditing={isEditing} />
  </li>;
};

const DefaultTab = ({ isSelected, updateState }: {
  isSelected: boolean,
  updateState: () => void
}) => <li id={styles["default"]} className={styles.tab}
          style={{ fontWeight: isSelected ? 700 : 400 }}>
  <button onClick={updateState}>*</button>
</li>;

type TabContentProps = {
  children: ReactNode
  isSelected: boolean
  isBeingEdited: boolean
  updateState: () => void
  stopEditing: () => void
  startEditing: () => void
}

const TabContent = ({
  children,
  startEditing,
  stopEditing,
  isBeingEdited,
  isSelected,
  updateState
}: TabContentProps) => {
  const fontWeight = isSelected ? 700 : 400;

  const onClick = isBeingEdited ? undefined : updateState;

  const onBlur = (e: FocusEvent<HTMLButtonElement>) => {
    if (e.relatedTarget !== null) return;
    stopEditing();
  };

  return <button style={{ fontWeight }} className={styles.editable}
                 onClick={onClick} onBlur={onBlur}
                 onDoubleClick={startEditing}>{children}</button>;
};

type EditTabProps = {
  onSubmit: (title: TitleForm) => void
}

const EditTab = ({ onSubmit }: EditTabProps) => {
  const {
    register,
    resetField,
    handleSubmit,
    formState: { errors }
  } = useForm<TitleForm>({
    resolver: zodResolver(TitleFormSchema)
  });
  useFormErrorHandling(errors);

  useEffect(() => () => resetField("name"), [resetField]);

  return <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register("name", { required: true })} />
    <input type="submit" className={styles.hidden} />
  </form>;
};

const AddTab = ({ addState }: { addState: () => void }) => {
  const ref = useRef<HTMLButtonElement | null>(null);

  const onClick = () => {
    addState();
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return <li className={styles.tab} id={styles["add"]}>
    <button ref={ref} onClick={onClick}>+</button>
  </li>;
};

type RemoveTabProps = {
  removeState: () => void
  isEditing: boolean
}

const RemoveTab = ({ isEditing, removeState }: RemoveTabProps) => {
  if (isEditing) return null;

  return <button className={styles.remove} onClick={removeState}>
    <X /></button>;
};

export default StateTabs;
