import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GetServerSidePropsContext } from "next";
import nookies from "nookies";

let token = "";
export const getClient = (context: GetServerSidePropsContext) => {
  console.log("in getClient: ", { tokenLength: token.length });
  const newToken = nookies.get(context).token;

  if (token !== newToken) {
    console.log("there is a new token with length: ", newToken.length);
    token = newToken;
  } else {
    console.log("token is the same as the old one");
  }

  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URI,
  });
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: newToken,
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
