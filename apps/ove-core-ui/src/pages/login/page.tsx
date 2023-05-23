import { FormEvent, useCallback } from "react";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { AppRouter } from "@ove/ove-core-router";
import { useNavigate } from "react-router-dom";

export type Tokens = {
  access: string,
  refresh: string
}

type PageProps = {
  setTokens: (tokens: Tokens) => void
}

export default ({ setTokens }: PageProps) => {
  const navigate = useNavigate();

  const fixedEncodeURI = useCallback((str: string) =>
    encodeURI(str).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16)), []);

  const createClient = useCallback((username: string, password: string) =>
    createTRPCProxyClient<AppRouter>({
      links: [
        httpLink({
          url: `http://localhost:3333/api/v1/trpc`,
          async headers() {
            const auth = fixedEncodeURI(window.btoa(`${username}:${password}`));
            return {
              authorization: `Basic ${auth}`
            };
          }
        })
      ],
      transformer: undefined
    }), []);

  const handleAuth = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");
    if (username === null || password === null) {
      console.log("Please enter username and password");
      return;
    }

    const login = await createClient(username.toString(), password.toString()).login.mutate();

    if (login === undefined) {
      console.log("Incorrect login");
      return;
    }

    console.log("Logging in");
    localStorage.setItem("tokens", JSON.stringify(login));
    setTokens(login);
    navigate("/", { replace: true });
  }, []);

  return <main>
    <h1>Login</h1>
    <form method="post" spellCheck="false" onSubmit={e => handleAuth(e)}>
      <h4>Enter credentials:</h4>
      <label htmlFor="username">Enter Username:</label>
      <input id="username" type="text" name="username" />
      <label htmlFor="password">Enter Password:</label>
      <input id="password" type="password" name="password" />
      <button type="submit">Log In</button>
    </form>
  </main>;
}