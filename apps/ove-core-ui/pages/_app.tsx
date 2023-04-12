import { AppProps } from "next/app";
import Head from "next/head";
import "../styles.scss";

/**
 * App code
 * @param {any} Component
 * @param {any} pageProps
 * @constructor
 */
function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to core-ui!</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default CustomApp;
