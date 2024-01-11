import React from "react";
import { trpc } from "../../utils/api";
import { isError } from "@ove/ove-types";
import ProjectCard from "./project-card";
import styles from "./launcher.module.scss";
import { Dialog, useDialog } from "@ove/ui-components";
import Controller from "../../components/controller/controller";
import { Plus } from "react-bootstrap-icons";

const Projects = () => {
  const { ref, closeDialog, isOpen, openDialog } = useDialog();
  const projects = trpc.projects.getProjects.useQuery();

  return projects.status === "success" && !isError(projects.data) ?
    <section className={styles["project-container"]}>
      <ul className={styles.projects}>
        {projects.data.filter(x => !isError(x))
          .map(project =>
            <ProjectCard key={project.id} project={project}
                         openDialog={openDialog} />)}
      </ul>
      <Dialog ref={ref} closeDialog={closeDialog} title="Launcher" style={{
        width: "calc((90vh / 9) * 16)",
        aspectRatio: "unset",
        height: "calc(90vh + 3rem)",
        maxHeight: "100vh"
      }} hiddenStyle={{ padding: 0 }}>
        <Controller />
      </Dialog>
      {isOpen ? <div id={styles["mask"]}></div> : null}
      <a href="/project-editor" id={styles["new"]}><Plus size={"2rem"} /></a>
    </section> : null;
};

export default Projects;
