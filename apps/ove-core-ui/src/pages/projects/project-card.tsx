import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@ove/ui-base-components";
import type { Project, User } from "@prisma/client";

import styles from "./project-card.module.scss";

type ProjectCardProps = {
  user: User
  project: Project
  openDialog: () => void
}

const ProjectCard = ({
  user,
  project,
  openDialog
}: ProjectCardProps) => {
  const navigate = useNavigate();
  const canEdit = user.role === "admin" ||
    ((user.id === project.creatorId ||
      project.collaboratorIds.includes(user.id)) && user.role !== "client");

  return <li key={project.title} className={styles.main}>
    <img src={project.thumbnail ?? "/missing-thumbnail.jpg"}
         alt={`Thumbnail for ${project.title}`} />
    <h4>{project.title}</h4>
    <div className={styles.actions}>
      {canEdit ? <Button
        className="rounded-r-none"
        variant="outline"
        onClick={() => navigate(`/project-editor?project=${project.id}`)}>
        EDIT
      </Button> : null}
      <Button onClick={openDialog} className="rounded-l-none">
        LAUNCH
      </Button>
    </div>
  </li>;
};

export default ProjectCard;
