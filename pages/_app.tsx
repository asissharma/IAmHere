import "@/styles/globals.css";
import "@/styles/globals.css";
import "@/styles/homePage.css";
import "@/lib/chartSetup"; // Register Chart.js globally
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
