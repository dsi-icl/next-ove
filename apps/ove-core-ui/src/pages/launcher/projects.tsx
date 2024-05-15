import React from "react";
import { trpc } from "../../utils/api";
import { isError } from "@ove/ove-types";
import ProjectCard from "./project-card";
import { type User } from "@prisma/client";
import styles from "./launcher.module.scss";
import { Dialog, useDialog } from "@ove/ui-components";
import Controller from "../../components/controller/controller";
import { Plus } from "react-bootstrap-icons";

const Projects = () => {
  const { ref, closeDialog, isOpen, openDialog } = useDialog();
  const projects = trpc.projects.getProjects.useQuery();
  const user = trpc.getUserID.useQuery();

  return projects.status === "success" && !isError(projects.data) &&
  user.status === "success" && !isError(user.data) ?
    <div style={{ position: "relative" }}>
      <section className={styles["project-container"]}>
        <h4 className={styles.heading}>Projects</h4>
        <ul className={styles.projects}>
          {projects.data.filter(x => !isError(x) && !x.isPublic)
            .map(project =>
              <ProjectCard key={project.id} project={project}
                           openDialog={openDialog} user={user.data as User} />)}
        </ul>
        <h4 className={styles.heading}>Public</h4>
        <ul className={styles.projects}>
          {projects.data.filter(x => !isError(x) && x.isPublic).map(project =>
            <ProjectCard project={project} openDialog={openDialog}
                         key={project.id} user={user.data as User} />)}
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
      </section>
      <a href="/project-editor" id={styles["new"]}><Plus size={"2rem"} /></a>
    </div> : null;
};

export default Projects;
