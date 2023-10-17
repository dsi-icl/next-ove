import { env } from "../../env";

import styles from "./home.module.scss";

const Home = () => <main className={styles.main}>
  <iframe src={env.PROJECT_LAUNCHER} title="Project Launcher"></iframe>
</main>;

export default Home;