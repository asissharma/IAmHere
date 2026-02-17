import "@/styles/globals.css";
import "@/styles/globals.css";
import "@/styles/homePage.css";
import "@/lib/chartSetup"; // Register Chart.js globally
import type { AppProps } from "next/app";

import GlobalSearch from "../components/GlobalSearch";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalSearch />
      <Component {...pageProps} />
    </>
  );
}
