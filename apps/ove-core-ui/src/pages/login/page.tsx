import { z } from "zod";
import React from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  useFormErrorHandling,
} from "@ove/ui-base-components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../../hooks/auth";
import { logger } from "../../env";

const LoginFormSchema = z.strictObject({
  username: z.string(),
  password: z.string(),
});

type LoginForm = z.infer<typeof LoginFormSchema>;

const Login = () => {
  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginFormSchema),
  });
  const login = useLogin();
  useFormErrorHandling(form.formState.errors);
  const onSubmit = form.handleSubmit(({ username, password }) => {
    login(username, password).catch(logger.error);
  });

  return (
    <main className="flex min-h-[90vh] items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your username and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  autoComplete="username"
                  placeholder="Enter your username"
                  autoCorrect="off"
                  {...form.register("username", {
                    required: "Username is required",
                  })}
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...form.register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>
            <Button className="mt-4 w-full bg-[#002147]" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Logging in" : "Log in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Login;
