// import styles from "./live-view.module.scss";
import { useParams } from "react-router-dom";

const LiveView = () => {
  const {streamURL} = useParams();
  console.log(streamURL);
  return <></>;
};

export default LiveView;