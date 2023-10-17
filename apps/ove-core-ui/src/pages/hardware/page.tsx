import { trpc } from "../../utils/api";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Observatory from "./components/observatory/observatory";

import styles from "./page.module.scss";

const Hardware = () => {
  const getObservatories = trpc.core.getObservatories.useQuery();

  return <HelmetProvider>
    <main className={styles.main}>
      <Helmet>
        <title>Next-OVE Hardware</title>
      </Helmet>
      <h1>Hardware Manager</h1>
      {getObservatories.status === "success" && !("oveError" in getObservatories.data) ? getObservatories.data?.map(({
        name,
        isOnline
      }) => <Observatory
        name={name} isOnline={isOnline} key={name}
      />) : null}
    </main>
  </HelmetProvider>;
};

export default Hardware;