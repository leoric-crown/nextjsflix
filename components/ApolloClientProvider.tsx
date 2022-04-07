import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloProvider,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "http://localhost:5000/nextjsflixfb/us-central1/graphql",
});

const cache = new InMemoryCache();

const ApolloClientProvider: React.FC = ({ children }) => {
  const { user } = useAuth();
  const [authorization, setAuthorization] = useState("");

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization,
      },
    };
  });
  const graphqlClient = new ApolloClient({
    link: authLink ? authLink.concat(httpLink) : httpLink,
    cache,
  });

  useEffect(() => {
    console.log("user changed", user);
    if (!user) {
      console.log("setting empty authorization header");
      setAuthorization("");
    }
    if (user) {
      const newClient = async () => {
        console.log("getting id token for user: ", { user });
        const token = await user.getIdToken();
        setAuthorization(token);
      };

      newClient();
    }
  }, [user]);

  return <ApolloProvider client={graphqlClient}>{children}</ApolloProvider>;
};

export default ApolloClientProvider;
