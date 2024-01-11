import React from "react";
import styles from "./video-streams.module.scss";

const VideoStreams = ({ streams }: { streams: string[] | undefined }) =>
  <main className={styles.main}>
    {streams?.map((stream, i) => <article key={stream}>
      <div className={styles.wrapper}>
        <iframe src={stream} title={`CAMERA-${i}`}></iframe>
      </div>
    </article>)}
  </main>;

export default VideoStreams;
