import React, { useEffect, useState } from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import UserContextProvider from "../context/UserContext";
import Loader from "../components/Loader";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleComplete = () => {
      setLoading(false);
    };
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  });
  return (
    <UserContextProvider>
      {loading ? <Loader/> : <Component {...pageProps} />}
    </UserContextProvider>
  );
}

export default MyApp;
