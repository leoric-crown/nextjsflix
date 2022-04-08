import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GetServerSidePropsContext } from "next";
import nookies from "nookies";

export const getClient = (context: GetServerSidePropsContext) => {
  const httpLink = createHttpLink({
    uri: process.env.GRAPHQL_URI,
  });
  const token = nookies.get(context).token;
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: token,
      },
    };
  });

  const client = new ApolloClient({
    ssrMode: true,
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return client;
};

export default getClient;
