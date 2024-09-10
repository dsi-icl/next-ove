import React from "react";
import { Json } from "@ove/ove-utils";
import { api } from "../../utils/api";
import { isError } from "@ove/ove-types";
import type { LaunchConfig } from "../../pages/project-editor/hooks";

import styles from "./controller.module.scss";

type ControllerProps = {
  config: LaunchConfig
}

const Controller = ({ config }: ControllerProps) => {
  const controller = api.projects.getController.useQuery({
    ...config,
    layout: config.layout === null ? undefined : Json.stringify(config.layout)
  }, { cacheTime: 0 });
  return <section id={styles["controller"]}>
    {controller.status === "success" && !isError(controller.data) ?
      <iframe title="controller" srcDoc={controller.data}></iframe> : null}
  </section>;
};

export default Controller;
