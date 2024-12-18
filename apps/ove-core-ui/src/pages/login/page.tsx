import { z } from "zod";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormErrorHandling } from "@ove/ui-components";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle, Input,
  Label
} from "@ove/ui-base-components";

const LoginFormSchema = z.strictObject({
  username: z.string(),
  password: z.string()
});

type LoginForm = z.infer<typeof LoginFormSchema>

const Login = ({ login }: {
  login: (username: string, password: string) => Promise<void>
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(LoginFormSchema)
  });
  useFormErrorHandling(errors);
  const onSubmit = handleSubmit(({
    username,
    password
  }) => login(username, password));

  // return <main className={styles.main}>
  //   <form method="post" spellCheck="false" onSubmit={onSubmit}>
  //     <h1>Sign in</h1>
  //     <label id={styles["username"]} htmlFor="username">Username</label>
  //     <input {...register("username", { required: true })} type="text"
  //            name="username" />
  //     <label id={styles["password"]} htmlFor="password">Password</label>
  //     <input {...register("password", { required: true })} id="password"
  //            type="password" name="password" />
  //     <button type="submit">Sign In</button>
  //   </form>
  // </main>;
  return <main
    className="min-h-[90vh] flex items-center justify-center bg-gray-100">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>Enter your username and password to access your
          account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && <p
                className="text-sm text-red-500">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
                })}
              />
              {errors.password && <p
                className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
          </div>
          <Button className="w-full mt-4 bg-[#002147]" type="submit">
            Log in
          </Button>
        </form>
      </CardContent>
    </Card>
  </main>
};

export default Login;
