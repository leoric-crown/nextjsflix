import { shield, rule } from "graphql-shield";

const isAuthenticated = rule()((parent, args, context) => {
  console.log("In isAuthenticated, authenticated: ", context.authenticated, {
    args,
  });
  return context.authenticated;
});

const permissions = shield(
  {
    Query: {
      video: isAuthenticated,
      stats: isAuthenticated,
    },
    Mutation: {
      video: isAuthenticated,
    },
  },
  {
    allowExternalErrors: true,
  }
);

export default permissions;
