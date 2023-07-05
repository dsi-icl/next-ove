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

  return <main style={{display: "flex", flexDirection: "column", width: "100vw", justifyContent: "center", alignItems: "center"}}>
    <form method="post" spellCheck="false" onSubmit={e => {
      handleAuth(e).catch(console.error);
    }} style={{display: "flex", flexDirection: "column", width: "20vw", marginTop: "2rem"}}>
      <h1 style={{fontSize: "24px", fontWeight: "700"}}>Sign in</h1>
      <label htmlFor="username" style={{fontWeight: "700", marginTop: "2rem"}}>Username</label>
      <input id="username" type="text" name="username" style={{border: "1px solid black", padding: "0.5rem", borderRadius: "20px"}} />
      <label htmlFor="password" style={{fontWeight: "700", marginTop: "1rem"}}>Password</label>
      <input id="password" type="password" name="password" style={{border: "1px solid black", padding: "0.5rem", borderRadius: "20px"}} />
      <button type="submit" style={{color: "white", backgroundColor: "#002147", marginTop: "3rem", padding: "0.5rem", borderRadius: "20px"}}>Sign In</button>
    </form>
  </main>;
}