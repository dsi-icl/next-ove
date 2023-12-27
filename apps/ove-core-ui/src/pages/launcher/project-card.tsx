import { env } from "../../env";
import { Project } from "@prisma/client";

import styles from "./project-card.module.scss";

type ProjectCardProps = {
  project: Project
  openDialog: () => void
}

const ProjectCard = ({
  project: { id, title, thumbnail },
  openDialog
}: ProjectCardProps) =>
  <li key={title} className={styles.main}>
    <img src={thumbnail ?? "/missing-thumbnail.jpg"}
         alt={`Thumbnail for ${title}`} />
    <h4>{title}</h4>
    <div className={styles.actions}>
      <a href={`${env.BASE_URL}/project-editor?project=${id}`}>EDIT</a>
      <button onClick={openDialog}>LAUNCH</button>
    </div>
  </li>;

export default ProjectCard;
