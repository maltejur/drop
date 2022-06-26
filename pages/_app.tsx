import { CssBaseline, GeistProvider } from "@geist-ui/core";
import Head from "next/head";
import "styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <GeistProvider>
      {/* <NProgress color={theme.palette.foreground} /> */}
      <Head>
        <title>Drop</title>
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <CssBaseline />
      <Component {...pageProps} />
    </GeistProvider>
  );
}

export default MyApp;
