import { useForm } from "react-hook-form";

type Form = {
  username: string
  password: string
}

const Login = ({login}: {login: (username: string, password: string) => Promise<void>}) => {
  const { register, handleSubmit } = useForm<Form>();
  const onSubmit = handleSubmit(async ({ username, password }) => {
    await login(username, password);
  });

  return <main style={{
    display: "flex",
    flexDirection: "column",
    width: "100vw",
    justifyContent: "center",
    alignItems: "center"
  }}>
    <form method="post" spellCheck="false" onSubmit={onSubmit} style={{
      display: "flex",
      flexDirection: "column",
      width: "20vw",
      marginTop: "2rem"
    }}>
      <h1 style={{ fontSize: "24px", fontWeight: "700" }}>Sign in</h1>
      <label htmlFor="username"
             style={{ fontWeight: "700", marginTop: "2rem" }}>Username</label>
      <input {...register("username", {required: true})} type="text" name="username" style={{
        border: "1px solid black",
        padding: "0.5rem",
        borderRadius: "20px"
      }} />
      <label htmlFor="password"
             style={{ fontWeight: "700", marginTop: "1rem" }}>Password</label>
      <input {...register("password", {required: true})} id="password" type="password" name="password" style={{
        border: "1px solid black",
        padding: "0.5rem",
        borderRadius: "20px"
      }} />
      <button type="submit" style={{
        color: "white",
        backgroundColor: "#002147",
        marginTop: "3rem",
        padding: "0.5rem",
        borderRadius: "20px"
      }}>Sign In
      </button>
    </form>
  </main>;
};

export default Login;
