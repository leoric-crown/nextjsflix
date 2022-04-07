import React, { useEffect, useState } from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { AuthContextProvider } from "../hooks/useAuth";
import Loader from "../components/Loader";
import ApolloClientProvider from "../components/ApolloClientProvider";

// const httpLink = createHttpLink({
//   uri: "http://localhost:5000/nextjsflixfb/us-central1/graphql",
// });

// const authLink = setContext((_, { headers }) => {
//   const token = "sometoken";
//   return {
//     headers: {
//       ...headers,
//       authorization: token,
//     },
//   };
// });

// const graphqlClient = new ApolloClient({
//   link: authLink.concat(httpLink),
//   cache: new InMemoryCache(),
// });

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
    <AuthContextProvider>
      <ApolloClientProvider>
        {loading ? <Loader /> : <Component {...pageProps} />}
      </ApolloClientProvider>
    </AuthContextProvider>
  );
}

export default MyApp;
