import {
  Controller,
  Gear,
  Incognito,
  RocketTakeoff,
  Save,
  Upload
} from "react-bootstrap-icons";
import { toast } from "sonner";
import { type ReactNode } from "react";
import { type Actions } from "../hooks";

import styles from "./actions.module.scss";

type ActionsProps = {
  setAction: (action: Actions | null) => void
  save: () => void
}

type Icon = {
  icon: ReactNode,
  color: `#${string}`,
  title: string,
  action: Actions | null
}

const Actions = ({ setAction, save }: ActionsProps) => {
  const iconSize = "1.25rem";
  const icons: Icon[] = [{
    icon: <Controller size={iconSize} />,
    color: "#ef476f",
    title: "Controller",
    action: "controller"
  }, {
    icon: <Upload size={iconSize} />,
    color: "#f78c6b",
    title: "Upload",
    action: "upload"
  }, {
    icon: <Incognito size={iconSize} />,
    color: "#ffd166",
    title: "Environment",
    action: "env"
  }, {
    icon: <Gear size={iconSize} />,
    color: "#06d6a0",
    title: "Project Details",
    action: "metadata"
  }, {
    icon: <RocketTakeoff size={iconSize} />,
    color: "#118ab2",
    title: "Launch",
    action: "launch"
  }, {
    icon: <Save size={iconSize} />,
    color: "#002147",
    title: "Save",
    action: null
  }];

  const handler = (action: Actions | null) => {
    if (action === null) {
      save();
      toast("Project saved successfully!");
      return;
    }

    setAction(action);
  };

  return <section
    id={styles["actions"]}>
    <div className={styles.actions}>
      {icons.map(icon => <div className={styles.action} key={icon.title}>
        <button onClick={() => handler(icon.action)}
                style={{ backgroundColor: icon.color }}
                title={icon.title}>{icon.icon}</button>
      </div>)}
    </div>
  </section>;
};

export default Actions;
