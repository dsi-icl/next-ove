import { useForm } from "react-hook-form";

import styles from "./page.module.scss";

type Form = {
  username: string
  password: string
}

const Login = ({ login }: {
  login: (username: string, password: string) => Promise<void>
}) => {
  const { register, handleSubmit } = useForm<Form>();
  const onSubmit = handleSubmit(async ({ username, password }) => {
    await login(username, password);
  });

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
