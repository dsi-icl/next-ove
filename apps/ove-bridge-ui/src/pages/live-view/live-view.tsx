import styles from "./live-view.module.scss";
import { useVideoStreams } from "./hooks";

const LiveView = () => {
  const streams = useVideoStreams();
  return <main className={styles.main}>
    {streams?.map((stream, i) => <article key={stream}><div className={styles.wrapper}><iframe src={stream} title={`CAMERA-${i}`}></iframe></div></article>)}
  </main>;
};

export default LiveView;