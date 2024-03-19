import { z } from "zod";
import React from "react";
import { useForm } from "react-hook-form";

import styles from "./page.module.scss";
import { zodResolver } from "@hookform/resolvers/zod";

const LoginFormSchema = z.strictObject({
  username: z.string(),
  password: z.string()
});

type LoginForm = z.infer<typeof LoginFormSchema>

const Login = ({ login }: {
  login: (username: string, password: string) => Promise<void>
}) => {
  const { register, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(LoginFormSchema)
  });
  const onSubmit = handleSubmit(({
    username,
    password
  }) => login(username, password));

  return <main className={styles.main}>
    <form method="post" spellCheck="false" onSubmit={onSubmit}>
      <h1>Sign in</h1>
      <label id={styles["username"]} htmlFor="username">Username</label>
      <input {...register("username", { required: true })} type="text"
             name="username" />
      <label id={styles["password"]} htmlFor="password">Password</label>
      <input {...register("password", { required: true })} id="password"
             type="password" name="password" />
      <button type="submit">Sign In</button>
    </form>
  </main>;
};

export default Login;
