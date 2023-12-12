import { trpc } from "../../utils/api";
import { isError } from "@ove/ove-types";
import {useNavigate} from "react-router-dom";
import {env} from "../../env";

const Projects = () => {
  const projects = trpc.projects.getProjects.useQuery();

  return projects.status === "success" && !isError(projects.data) ? <section>
    <ul style={{padding: "2rem", display: "grid", justifyItems: "center", gridTemplateColumns: "1fr 1fr 1fr 1fr"}}>{projects.data.filter(x => !isError(x)).map(({id, title, thumbnail}) => <li key={title} style={{maxWidth: "192px"}}>
      <img src={thumbnail ?? "/missing-thumbnail.jpg"} alt={`Thumbnail for ${title}`} style={{maxWidth: "192px", maxHeight: "192px", aspectRatio: "1/1"}}/>
      <h4 style={{color: "white", textAlign: "center"}}>{title}</h4>
      <div style={{display: "flex"}}>
        <a>LAUNCH</a>
        <a href={`${env.BASE_URL}/project-editor?project=${id}`}>EDIT</a>
      </div>
    </li>)}</ul>
  </section> : <></>;
};

export default Projects;
