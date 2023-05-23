import styles from "./nav.module.scss";
import { Tokens } from "../pages/login/page";
import { Link, useLocation } from "react-router-dom";

export type NavProps = {
  tokens: Tokens | null
  login: () => void
  logout: () => void
}

export default ({tokens, login, logout}: NavProps) => {
  const location = useLocation();
  return <nav className={styles.nav}>
    {location.pathname !== "/login" ?
      <div style={{ display: "flex" }}>
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
}