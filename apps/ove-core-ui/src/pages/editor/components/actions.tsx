import { Eye, HatGlasses, Joystick, Rocket, Save, Settings, Upload } from "lucide-react";
import { env, logger } from "../../../env";
import type { TActions } from "../hooks/dialog";
import { DialogTrigger } from "@ove/ui-base-components";
import { useProjectId, useSave } from "../hooks/projects";
import React, { type ReactNode, useCallback } from "react";
import { toast } from "sonner";

type Icon = {
  icon: ReactNode;
  color: `#${string}`;
  title: string;
  action: TActions | null;
};

const icons: Icon[] = [
  {
    icon: <Settings className="size-5" />,
    color: "#ef476f",
    title: "Project Details",
    action: "metadata",
  },
  {
    icon: <Upload className="size-5" />,
    color: "#f78c6b",
    title: "Upload",
    action: "upload",
  },
  {
    icon: <Joystick className="size-5" />,
    color: "#ffd166",
    title: "Controller",
    action: "controller",
  },
  {
    icon: <HatGlasses className="size-5" />,
    color: "#06d6a0",
    title: "Environment",
    action: "env",
  },
  {
    icon: <Eye className="size-5" />,
    color: "#118ab2",
    title: "Preview",
    action: "preview"
  },
  {
    icon: <Rocket className="size-5" />,
    color: "#002147",
    title: "Launch",
    action: "launch",
  },
  {
    icon: <Save className="size-5" />,
    color: "#9810fa",
    title: "Save",
    action: null,
  },
];

type ActionButtonProps = {
  icon: Icon;
  onClick: () => void;
};

const ActionButton = ({ icon, onClick }: ActionButtonProps) => {
  const baseProps = {
    onClick,
    style: { backgroundColor: icon.color },
    className: "rounded-[50%] p-3 text-white",
    title: icon.title,
  };

  return icon.action === null ? (
    <button type="button" {...baseProps}>
      {icon.icon}
    </button>
  ) : (
    <DialogTrigger {...baseProps}>{icon.icon}</DialogTrigger>
  );
};

type ActionsProps = {
  setAction: (action: TActions | null) => void;
};

const Actions = ({ setAction }: ActionsProps) => {
  const save = useSave();
  const projectId = useProjectId();

  const handler = useCallback(
    (action: TActions | null) => {
      if ((action === "controller" || 
          action === "env" || 
          action === "upload") &&
          projectId.length === env.CONSTANTS.NEW_PROJECT_ID_LENGTH) {
        toast.error("Please save the project before performing this action.");
        return;
      }

      if (action === null) {
        save().catch(logger.error);
        return;
      }

      setAction(action);
    },
    [setAction, save, projectId.length],
  );

  return (
    <section className="size-full p-4">
      <div className="flex h-[calc(100%-2rem)] flex-col justify-around">
        {icons.map((icon) => (
          <div className="flex place-items-center" key={icon.title}>
            <ActionButton
              icon={icon}
              onClick={() => handler(icon.action)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Actions;
