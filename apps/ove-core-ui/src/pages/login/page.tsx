import { FormEvent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {createAuthClient} from "../../utils";

export type Tokens = {
  access: string,
  refresh: string
}

type PageProps = {
  setTokens: (tokens: Tokens) => void
}

export default ({ setTokens }: PageProps) => {
  const navigate = useNavigate();

  const handleAuth = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");
    if (username === null || password === null) {
      console.log("Please enter username and password");
      return;
    }

    const login = await createAuthClient(username.toString(), password.toString()).login.mutate();

    if (login === undefined) {
      console.log("Incorrect login");
      return;
    }

    console.log("Logging in");
    sessionStorage.setItem("tokens", JSON.stringify(login));
    setTokens(login);
    navigate("/", { replace: true });
  }, []);

  return <main>
    <h1>Login</h1>
    <form method="post" spellCheck="false" onSubmit={e => {
      handleAuth(e).catch(console.error);
    }}>
      <h4>Enter credentials:</h4>
      <label htmlFor="username">Enter Username:</label>
      <input id="username" type="text" name="username" />
      <label htmlFor="password">Enter Password:</label>
      <input id="password" type="password" name="password" />
      <button type="submit">Log In</button>
    </form>
  </main>;
}