import React from "react";
import { api } from "../../utils/api";
import { isError } from "@ove/ove-types";
import { useNavigate } from "react-router-dom";
import type { Project, User } from "@prisma/client";
import { Button, DialogTrigger } from "@ove/ui-base-components";

type ProjectCardProps = {
  user: User;
  project: Project;
  openConfig: (project: Project) => void;
};

const limitText = (text: string, limit: number) =>
  text.length > limit ? `${text.slice(0, limit)}…` : text;

const ProjectCard = ({ user, project, openConfig }: ProjectCardProps) => {
  const navigate = useNavigate();
  const getCollaborators = api.projects.getCollaboratorsForProject.useQuery({
    projectId: project.id,
  });
  const canEdit =
    user.role === "admin" ||
    ((user.id === project.creatorId ||
      (getCollaborators.status === "success" &&
        !isError(getCollaborators.data) &&
        getCollaborators.data.find(
          collaborator => collaborator.id === user.id,
        ) !== undefined)) &&
      user.role !== "client");

  return (
    <li
      key={project.title}
      className="max-w-[calc(1.5rem+256px)] rounded-xl border border-gray-200 p-3"
    >
      <img
        className="aspect-square w-full rounded-xl"
        src={project.thumbnail ?? "/missing-thumbnail.jpg"}
        alt={`Thumbnail for ${project.title}`}
      />
      <h4 className="mt-2 font-bold text-black">{project.title}</h4>
      <p className="mt-1 text-black">{limitText(project.description, 140)}</p>
      <div className="mt-2 flex justify-between">
        {canEdit ? (
          <Button
            className="w-full rounded-r-none"
            variant="outline"
            onClick={() => navigate(`/project-editor?project=${project.id}`)}
          >
            EDIT
          </Button>
        ) : null}
        <DialogTrigger
          onClick={() => openConfig(project)}
          className="w-full rounded rounded-l-none bg-[#002147] text-white"
        >
          LAUNCH
        </DialogTrigger>
      </div>
    </li>
  );
};

export default ProjectCard;
