// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from "./app.module.scss";
import Home from "../pages/home/page";
import Hardware from "../pages/hardware/page";
import Login, { Tokens } from "../pages/login/page";

import {
  useNavigate,
  Route,
  Routes,
  Link,
  useLocation
} from "react-router-dom";
import { useState } from "react";
import ProtectedRoute from "../components/protected-route";


export function App() {
  const [tokens, setTokens] = useState<Tokens | null>(() => {
    const stored = localStorage.getItem("tokens");
    if (stored === null) return stored;
    return JSON.parse(stored);
  });

  const navigate = useNavigate();
  const location = useLocation();

  const login = async () => navigate("/login");
  const logout = async () => {
    console.log("Logging out");
    localStorage.removeItem("tokens");
    setTokens(null);
  };

  return (
    <>
        <nav className={styles.nav}>
          {location.pathname !== "/login" ?
            <div style={{display: "flex"}}>
          <ul>
            <li><Link to="/hardware" style={{
              textDecoration: "none",
              color: "white"
            }}>Hardware</Link></li>
          </ul>
          {tokens === null ?
            <button className={styles.login} onClick={() => login()}>Log
              in</button> :
            <button className={styles.login} onClick={() => logout()}>Log
              out</button>}</div> : null}
        </nav>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/hardware"
          element={<ProtectedRoute children={<Hardware />}
                                   condition={tokens !== null}
                                   redirectTo={"/login"} />}
        />
        <Route
          path="/login"
          element={<Login setTokens={(tokens) => setTokens(tokens)} />}
        />
      </Routes>
    </>
  );
}

export default App;
