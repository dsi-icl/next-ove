import { Route, Routes, Link } from "react-router-dom";
import { API } from "@ove/ove-bridge-shared";
import styles from "./app.module.scss";
import Home from "../pages/home/home";
import Auth from "../pages/auth/auth";

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    electron: API & {receive: (event: string, listener: (...args: any[]) => void) => void};
  }
}

/**
 * OVE Bridge App
 * @constructor
 */
export function App() {
  return (
    <>
      <nav className={styles.nav}>
        <Link to="/"><img src={"/icon.svg"} alt={"OVE Client Logo"}
                          className={styles.logo}></img></Link>
        <ul>
          <li><Link to="/auth" style={{
            color: "white",
            textDecoration: "none"
          }}>Auth</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/auth"
          element={<Auth />}
        />
      </Routes>
    </>
  );
}

export default App;
