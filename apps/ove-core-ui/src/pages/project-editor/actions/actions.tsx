import { type Actions } from "../hooks";
import {
  Controller,
  Eye,
  Gear,
  RocketTakeoff,
  Save,
  Upload
} from "react-bootstrap-icons";

import styles from "./actions.module.scss";
import { type ReactNode } from "react";

type ActionsProps = {
  setAction: (action: Actions | null) => void
}

type Icon = {
  icon: ReactNode,
  color: `#${string}`,
  title: string,
  action: Actions | null
}

const Actions = ({ setAction }: ActionsProps) => {
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
    icon: <Eye size={iconSize} />,
    color: "#ffd166",
    title: "Preview",
    action: "preview"
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
      console.log("Saving"); // TODO: replace with saving to database
      return;
    }

    setAction(action);
  };

  return <section
    id={styles["actions"]}>
    <h2>Actions</h2>
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
