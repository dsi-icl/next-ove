// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import Home from "../pages/home/page";
import Hardware from "../pages/hardware/page";

import { Route, Routes, Link } from 'react-router-dom';

export function App() {
  return (
    <>
      <nav className={styles.nav}>
        <ul>
          <li><Link to="/hardware"></Link></li>
        </ul>
      </nav>
      <Routes>
        <Route
          path="/"
          element={<Home/>}
        />
        <Route
          path="/hardware"
          element={<Hardware/>}
        />
      </Routes>
    </>
  );
}

export default App;
