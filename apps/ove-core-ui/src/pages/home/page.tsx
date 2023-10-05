import styles from "./home.module.scss";
import { env } from "../../env";

const Home = () => <main className={styles.main}>
  <iframe src={env.PROJECT_LAUNCHER} title="Project Launcher"></iframe>
</main>;

export default Home;