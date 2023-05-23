import Nav from "./nav";
import Router from "./router";
import { useState } from "react";
import { Tokens } from "../pages/login/page";
import { useNavigate } from "react-router-dom";


export function App() {
  const [tokens, setTokens] = useState<Tokens | null>(() => {
    const stored = localStorage.getItem("tokens");
    if (stored === null) return stored;
    return JSON.parse(stored);
  });

  const navigate = useNavigate();

  const login = () => {
    navigate("/login");
  };
  const logout = () => {
    console.log("Logging out");
    localStorage.removeItem("tokens");
    setTokens(null);
    navigate("/", { replace: true });
  };

  return (
    <>
      <Nav tokens={tokens} login={login} logout={logout} />
      <Router tokens={tokens} setTokens={(tokens) => setTokens(tokens)} />
    </>
  );
}

export default App;
