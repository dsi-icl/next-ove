import { z } from "zod";
import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useFormErrorHandling,
} from "@ove/ui-base-components";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, s3 } from "../../../utils/api";
import { CameraIcon } from "lucide-react";

const UserFormSchema = z.strictObject({
  name: z.string(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.union([z.literal("creator"), z.literal("admin")]),
  profilePicture: z.custom<FileList>().optional(),
});

type UserFormValues = z.infer<typeof UserFormSchema>;

const CreateUser = () => {
  const [preview, setPreview] = useState<string>();
  const createUser = api.admin.createUser.useMutation({
    onSuccess: () => {
      toast.success("User created successfully");
      form.reset();
      setPreview(undefined);
    },
    onError: () => {
      toast.error("Failed to create user");
    },
  });
  const utils = api.useUtils();
  const uploadFile = s3.uploadFile.useMutation({
    onSuccess: () => {
      toast.success("Profile picture uploaded successfully");
    },
    onError: () => {
      toast.error("Unable to upload profile picture");
    },
  });
  const form = useForm<UserFormValues>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: "creator",
      profilePicture: undefined,
    },
    resolver: zodResolver(UserFormSchema),
  });
  useFormErrorHandling(form.formState.errors);

  const onSubmit = async (data: UserFormValues) => {
    try {
      const { profilePicture, ...input } = data;
      let icon: string | undefined = undefined;
      if (profilePicture !== undefined) {
        const url = await utils.client.admin.getUserProfileUpload.query({ filename: profilePicture[0].name });
        await uploadFile.mutateAsync({ url, payload: profilePicture[0] });
        icon = profilePicture[0].name;
      }
      await createUser.mutateAsync({ ...input, icon });
    } catch (_e) {
      toast.error("Failed to create user");
    }
  };

  return (
    <main className="flex h-[90vh] overflow-hidden w-screen items-center justify-center">
      <Card className="w-[600px] p-6">
        <CardHeader className="flex flex-col items-center">
          <CardTitle>Create User</CardTitle>
          <CardDescription>Add a user</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className=""
        >
          <FormField
            control={form.control}
            name="profilePicture"
            render={({ field }) => {
              const name = form.watch("name");
              const initials = useMemo(() => name?.replaceAll("-", " ")?.split(" ")?.map((x) => x.at(0))?.filter(Boolean)?.join("") ?? "", [name]);
              const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const files = e.target.files;
                field.onChange(files);
                if (files?.length) {
                  setPreview(URL.createObjectURL(files[0]));
                }
              };
              return (
                <FormItem className="flex justify-center">
                    <label className="relative block w-32 h-32 cursor-pointer group">
                      <Avatar className="w-full h-full">
                        {preview ? (
                          <AvatarImage src={preview} alt="Avatar preview" />
                        ) : (
                          <AvatarFallback>{initials.length > 0 ? initials : "JD"}</AvatarFallback>
                        )}
                      </Avatar>
                      <div
                        className="
                absolute inset-0 rounded-full
                bg-black bg-opacity-30
                flex items-center justify-center
                opacity-0 group-hover:opacity-100
                transition
              "
                      >
                        <CameraIcon className="w-6 h-6 text-white" />
                      </div>
                      <FormControl>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleChange}
                      />
                      </FormControl>
                    </label>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" autoComplete="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
            {form.formState.isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </form>
      </Form>
        </CardContent>
      </Card>
    </main>
  );
};

export default CreateUser;
