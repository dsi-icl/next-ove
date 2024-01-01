import { type Project } from "@prisma/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@ove/ui-base-components";

import styles from "./project-card.module.scss";

type ProjectCardProps = {
  project: Project
  openDialog: () => void
}

const ProjectCard = ({
  project: { id, title, thumbnail },
  openDialog
}: ProjectCardProps) => {
  const navigate = useNavigate();

  return <li key={title} className={styles.main}>
    <img src={thumbnail ?? "/missing-thumbnail.jpg"}
         alt={`Thumbnail for ${title}`} />
    <h4>{title}</h4>
    <div className={styles.actions}>
      <Button onClick={() => navigate(`/project-editor?project=${id}`)}>
        EDIT
      </Button>
      <Button onClick={openDialog}>
        LAUNCH
      </Button>
    </div>
  </li>;
};

export default ProjectCard;
