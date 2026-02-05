import React from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import type { Project, User } from ".prisma/client";
import { Button, DialogTrigger } from "@ove/ui-base-components";
import { fromURL, useFiles } from "../editor/hooks/files";

type ProjectCardProps = {
  user: User;
  project: Omit<Project, "isDeleted">;
  openConfig: (project: Omit<Project, "isDeleted">) => void;
};

const limitText = (text: string, limit: number) =>
  text.length > limit ? `${text.slice(0, limit)}…` : text;

const ProjectCard = ({ user, project, openConfig }: ProjectCardProps) => {
  const navigate = useNavigate();
  const getCollaborators = api.projects.getCollaboratorsForProject.useQuery({
    projectId: project.id,
  });
  const { local } = useFiles(project.id);
  const thumbnail = fromURL(local, project.thumbnail);
  const thumbnailURL = api.projects.getPresignedGetURL.useQuery(
    {
      bucketName: thumbnail?.bucketName ?? "ERROR",
      objectName: thumbnail?.name ?? "ERROR",
      versionId: thumbnail?.version ?? "ERROR",
    },
    { enabled: thumbnail !== null },
  );
  const isAdmin = user.role === "admin";
  const isCreator = user.id === project.creatorId;
  const isCollaborator = getCollaborators.status === "success" &&
    getCollaborators.data.find(
      (collaborator) => collaborator.id === user.id,
    ) !== undefined;
  const canEdit = isAdmin || isCreator || isCollaborator;

  return (
    <li
      key={project.title}
      className="flex h-full max-w-[calc(1.5rem+256px)] flex-col rounded-xl border border-gray-200 p-3"
    >
      <img
        className="aspect-square w-full rounded-xl"
        src={
          thumbnailURL.status === "success"
            ? thumbnailURL.data
            : "/missing-thumbnail.jpg"
        }
        alt={`Thumbnail for ${project.title}`}
      />
      <h4 className="mt-2 font-bold text-black">{project.title}</h4>
      <p className="mb-2 mt-1 text-black">
        {limitText(project.description, 140)}
      </p>
      <div className="mt-auto flex w-full justify-between">
        {canEdit ? (
          <Button
            className="w-full rounded-r-none"
            variant="outline"
            onClick={() => navigate(`/editor?project=${project.id}`)}
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
