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
  uri: process.env.GRAPHQL_URI,
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
    if (!user) {
      setAuthorization("");
    }
    if (user) {
      const newClient = async () => {
        const token = await user.getIdToken();
        setAuthorization(token);
      };

      newClient();
    }
  }, [user]);

  return <ApolloProvider client={graphqlClient}>{children}</ApolloProvider>;
};

export default ApolloClientProvider;
