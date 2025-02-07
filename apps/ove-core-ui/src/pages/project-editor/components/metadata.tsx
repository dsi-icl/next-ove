import {
  fromURL,
  getLatest,
  toURL,
  useFiles,
  useThumbnail
} from "../hooks/files";
import { z } from "zod";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Button,
  Checkbox,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  cn,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea
} from "@ove/ui-base-components";
import { actionColors } from "../utils";
import { assert } from "@ove/ove-utils";
import { useTags } from "../hooks/tags";
import { useForm } from "react-hook-form";
import type { File } from "@ove/ove-types";
import { useProjectStore } from "../hooks/projects";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePublications } from "../hooks/publications";
import { useCollaborators } from "../hooks/collaborators";
import { useFormErrorHandling } from "@ove/ui-components";
import React, { useRef, useState, useEffect } from "react";
import { Check, ChevronsUpDown, Paintbrush, X } from "lucide-react";
import S3FileSelect from "../../../components/s3-file-select/s3-file-select";

const sumText = (text: string) => text.split("").reduce((acc, x) => acc + x.charCodeAt(0), 0);

const useFileName = (files: File[], bucketName: string, fileName: string | null | undefined, setValue: (k: "fileVersion", version: string) => void) => {
  useEffect(() => {
    if (fileName === null || fileName === undefined) return;
    setValue("fileVersion", getLatest(files, bucketName, fileName).version);
  }, [setValue, fileName, bucketName]);
};

const ProjectMetadataSchema = z.strictObject({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnail: z.string().nullable(),
  creatorId: z.string(),
  tags: z.string().array(),
  publications: z.string().array(),
  presenterNotes: z.string(),
  notes: z.string(),
  isPublic: z.boolean(),
  bucket: z.string().nullable()
});

const CustomDataSchema = z.strictObject({
  fileName: z.string().nullable().optional(),
  fileVersion: z.string().nullable().optional(),
  tag: z.string().optional(),
  publication: z.string().optional()
});

const MetadataFormSchema =
  ProjectMetadataSchema.omit({
    id: true,
    publications: true,
    tags: true,
    thumbnail: true,
    creatorId: true,
    bucket: true
  }).merge(CustomDataSchema).strict();

type MetadataForm = z.infer<typeof MetadataFormSchema>

const Metadata = () => {
  const project = useProjectStore(state => state.project);
  const {
    collaborators,
    users,
    inviteCollaborator,
    removeCollaborator
  } = useCollaborators(project);
  const allTags = useTags(project.tags);
  const allPublications = usePublications(project.publications);
  const setProject = useProjectStore(state => state.setProject);
  const [selectedTags, setSelectedTags] = useState(project.tags);
  const [tags, setTags] = useState(allTags);
  const [selectedPublications, setSelectedPublications] = useState(project.publications);
  const [publications, setPublications] = useState(allPublications);
  const { local } = useFiles(project.id);
  const thumbnail = fromURL(local, project.thumbnail);
  const generateThumbnail = useThumbnail(project.id, selectedTags);
  const form = useForm<MetadataForm>({
    defaultValues: {
      title: project.title,
      description: project.description,
      presenterNotes: project.presenterNotes,
      isPublic: project.isPublic,
      notes: project.notes,
      fileName: thumbnail?.name ?? undefined,
      fileVersion: thumbnail?.version ?? undefined
    },
    resolver: zodResolver(MetadataFormSchema)
  });
  const fileName = form.watch("fileName");
  useFileName(local, project.bucket ?? "ERROR", fileName, form.setValue);
  useFormErrorHandling(form.formState.errors);
  const [tagOpen, setTagOpen] = useState(false);
  const [publicationOpen, setPublicationOpen] = useState(false);
  const [collaboratorOpen, setCollaboratorOpen] = useState(false);
  const tagRef = useRef<HTMLDivElement | null>(null);
  const publicationRef = useRef<HTMLDivElement | null>(null);
  const collaboratorRef = useRef<HTMLDivElement | null>(null);

  const onSubmit = (data: MetadataForm) => {
    setProject(cur => ({
      ...cur,
      title: data.title,
      description: data.description,
      notes: data.notes,
      presenterNotes: data.presenterNotes,
      tags: selectedTags,
      publications: selectedPublications,
      isPublic: data.isPublic,
      thumbnail: data.fileName === null || data.fileName === undefined || data.fileVersion === null || data.fileVersion === undefined ? null : toURL(assert(project.bucket), data.fileName, data.fileVersion)
    }));
  };

  return <DialogContent>
    <DialogHeader>
      <DialogTitle>Project Settings</DialogTitle>
      <DialogDescription>Edit project settings</DialogDescription>
    </DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col overflow-y-scroll max-h-[65vh] pl-1 pr-1">
        <FormField name="title" control={form.control}
                   render={({ field }) => <FormItem>
                     <FormLabel className="font-semibold">Title</FormLabel>
                     <FormControl><Input {...field} /></FormControl>
                   </FormItem>} />
        <FormField name="title" control={form.control}
                   render={({ field }) => <FormItem className="mt-4">
                     <FormLabel
                       className="font-semibold">Description</FormLabel>
                     <FormControl><Textarea {...field} /></FormControl></FormItem>} />
        <Label htmlFor="file-select"
               className="font-semibold mt-4">Thumbnail</Label>
        <div className="flex items-center">
          <S3FileSelect id="file-select" files={local}
                        disabled={local.length === 0} fileName={fileName}
                        control={form.control} />
          <Button onClick={generateThumbnail} type="button"
                  className="rounded-[50%] mt-2 ml-1 p-2 h-[unset]"><Paintbrush
            className="h-4 w-4" /></Button>
        </div>
        <FormField control={form.control} name="isPublic"
                   render={({ field }) => <FormItem
                     className="space-y-0 mt-4 flex flex-row items-start">
                     <FormLabel className="font-semibold">Public</FormLabel>
                     <FormControl
                       className="flex flex-row items-center justify-items-center mt-0">
                       <Checkbox {...field} checked={field.value}
                                 className="ml-auto"
                                 onCheckedChange={field.onChange}
                                 value={undefined} />
                     </FormControl>
                   </FormItem>} />
        <div ref={tagRef} className="flex flex-col h-full w-full">
          <FormField name="tag" control={form.control} render={({ field }) =>
            <FormItem className="mt-4 flex flex-col w-full">
              <FormLabel className="font-semibold">Tags</FormLabel>
              <Popover open={tagOpen} onOpenChange={setTagOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={tagOpen}
                    className="w-full justify-between mt-2"
                  >
                    Select tags...
                    <ChevronsUpDown
                      className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent container={tagRef.current ?? undefined}
                                className="w-[calc(90%-4px)] p-0">
                  <Command>
                    <FormControl>
                      <CommandInput onValueChange={v => form.setValue("tag", v)}
                                    onKeyUp={({ key }) => {
                                      if (key !== "Enter") return;
                                      if (tags.includes(field.value ?? "")) return;
                                      setTags(prev => field.value === undefined || field.value === "" ? prev : [...prev, field.value]);
                                      setSelectedTags(prev => field.value === undefined || field.value === "" ? prev : [...prev, field.value]);
                                      form.setValue("tag", "");
                                      setTagOpen(false);
                                    }} placeholder="Search tags..." />
                    </FormControl>
                    <CommandList>
                      <CommandEmpty>No tags found.</CommandEmpty>
                      <CommandGroup>
                        {tags.map(tag => <CommandItem
                          className="cursor-pointer"
                          key={tag}
                          value={tag}
                          onSelect={() => {
                            if (!selectedTags.includes(tag)) {
                              setSelectedTags(prev => [...prev, tag]);
                            } else {
                              setSelectedTags(prev => prev.filter(t => t !== tag));
                            }
                            form.setValue("tag", "");
                            setTagOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTags.includes(tag) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {tag}
                        </CommandItem>)}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover></FormItem>} />
          {selectedTags.length > 0 ? <ul
            className="flex flex-wrap w-full mt-4 gap-1 p-1">
            {selectedTags.map(tag =>
              <li key={tag}
                  className="w-fit h-fit p-1 pl-2 pr-2 rounded-3xl text-white flex items-center"
                  style={{ backgroundColor: actionColors[sumText(tag) % actionColors.length] }}>{tag}
                <Button type="button" variant="ghost"
                        className="w-fit h-fit p-0 m-0 ml-1 bg-transparent"
                        onClick={() => setSelectedTags(cur => cur.filter(t => t !== tag))}>
                  <X /></Button>
              </li>)}
          </ul> : null}
        </div>
        <div ref={publicationRef} className="flex flex-col h-full w-full">
          <FormField name="publication" control={form.control}
                     render={({ field }) =>
                       <FormItem className="mt-4 flex flex-col w-full">
                         <FormLabel
                           className="font-semibold">Publications</FormLabel>
                         <Popover open={publicationOpen}
                                  onOpenChange={setPublicationOpen}>
                           <PopoverTrigger asChild>
                             <Button
                               variant="outline"
                               role="combobox"
                               aria-expanded={publicationOpen}
                               className="w-full justify-between mt-2"
                             >
                               Select publications...
                               <ChevronsUpDown
                                 className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                             </Button>
                           </PopoverTrigger>
                           <PopoverContent
                             container={publicationRef.current ?? undefined}
                             className="w-full p-0">
                             <Command>
                               <FormControl>
                                 <CommandInput
                                   onValueChange={v => form.setValue("publication", v)}
                                   onKeyUp={({ key }) => {
                                     if (key !== "Enter") return;
                                     if (publications.includes(field.value ?? "")) return;
                                     setPublications(prev => field.value === undefined || field.value === "" ? prev : [...prev, field.value]);
                                     setSelectedPublications(prev => field.value === undefined || field.value === "" ? prev : [...prev, field.value]);
                                     form.setValue("publication", "");
                                     setPublicationOpen(false);
                                   }} placeholder="Search publications..." />
                               </FormControl>
                               <CommandList>
                                 <CommandEmpty>No publications
                                   found.</CommandEmpty>
                                 <CommandGroup>
                                   {publications.map(publication => <CommandItem
                                     className="cursor-pointer"
                                     key={publication}
                                     value={publication}
                                     onSelect={() => {
                                       if (selectedPublications.includes(publication)) {
                                         setSelectedPublications(prev => prev.filter(p => p !== publication));
                                       } else {
                                         setSelectedPublications(prev => [...prev, publication]);
                                       }
                                       form.setValue("publication", "");
                                       setPublicationOpen(false);
                                     }}
                                   >
                                     <Check
                                       className={cn(
                                         "mr-2 h-4 w-4",
                                         selectedPublications.includes(publication) ? "opacity-100" : "opacity-0"
                                       )}
                                     />
                                     {publication}
                                   </CommandItem>)}
                                 </CommandGroup>
                               </CommandList>
                             </Command>
                           </PopoverContent>
                         </Popover></FormItem>} />
          {selectedPublications.length > 0 ? <ul
            className="flex flex-wrap w-full mt-4 gap-1 p-1">
            {selectedPublications.map(publication =>
              <li key={publication}
                  className="w-fit h-fit p-1 pl-2 pr-2 rounded-3xl text-white flex items-center"
                  style={{ backgroundColor: actionColors[sumText(publication) % actionColors.length] }}>{publication}
                <Button variant="ghost" type="button"
                        className="w-fit h-fit p-0 m-0 ml-1"
                        onClick={() => setSelectedPublications(cur => cur.filter(p => p !== publication))}>
                  <X /></Button>
              </li>)}
          </ul> : null}
        </div>
        <div className="w-full mt-4" ref={collaboratorRef}>
          <h6 className="text-sm font-semibold">Collaborators</h6>
          <Popover open={collaboratorOpen}
                   onOpenChange={setCollaboratorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={collaboratorOpen}
                className="w-full justify-between mt-2"
              >
                Invite collaborators...
                <ChevronsUpDown
                  className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              container={collaboratorRef.current ?? undefined}
              className="w-full p-0">
              <Command>
                <FormControl>
                  <CommandInput placeholder="Search publications..." />
                </FormControl>
                <CommandList>
                  <CommandEmpty>No collaborators
                    found.</CommandEmpty>
                  <CommandGroup>
                    {users.map(user => <CommandItem
                      className="cursor-pointer"
                      key={user.id}
                      value={user.id}
                      onSelect={() => {
                        inviteCollaborator(user.id);
                        setCollaboratorOpen(false);
                      }}
                    >
                      <div key={user.id}
                           className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={user.icon ?? undefined}
                                         alt={user.name ?? user.username} />
                            <AvatarFallback>{user.name?.charAt(0) ?? "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p
                              className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    </CommandItem>)}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="space-y-2 mt-2">
            {collaborators.map(collaborator => <div key={collaborator.id}
                                                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={collaborator.icon ?? undefined}
                               alt={collaborator.name ?? "collaborator name"} />
                  <AvatarFallback>{collaborator.name?.charAt(0) ?? "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{collaborator.name}</p>
                  <p
                    className="text-sm text-gray-500">{collaborator.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={collaborator.status === "accepted" || collaborator.status === "creator" ? "default" : "secondary"}>
                  {collaborator.status === "accepted" || collaborator.status === "creator" ?
                    <Check className="w-4 h-4 mr-1" /> : null}
                  {collaborator.status}
                </Badge>
                {collaborator.status !== "creator" ?
                  <Button variant="ghost" size="sm" type="button"
                          onClick={() => removeCollaborator(collaborator.id)}>
                    <X className="w-4 h-4" />
                  </Button> : null}
              </div>
            </div>)}
          </div>
        </div>
        <FormField control={form.control} name="notes"
                   render={({ field }) => <FormItem className="mt-4">
                     <FormLabel className="font-semibold">Notes</FormLabel>
                     <FormControl><Textarea {...field} /></FormControl>
                   </FormItem>} />
        <FormField control={form.control} name="presenterNotes"
                   render={({ field }) => <FormItem className="mt-4">
                     <FormLabel className="font-semibold">Presenter
                       Notes</FormLabel>
                     <FormControl><Textarea {...field} /></FormControl>
                   </FormItem>} />
        <div className="flex mt-4 ml-auto justify-items-center">
          <DialogClose asChild><Button variant="default" type="submit">UPDATE</Button></DialogClose>
        </div>
      </form>
    </Form>
  </DialogContent>;
};

export default Metadata;
