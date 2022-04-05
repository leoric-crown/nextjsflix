import { shield, rule } from "graphql-shield";

const isAuthenticated = rule()((parent, args, context) => {
  return context.authenticated;
});

const permissions = shield({
  Query: {
    stats: isAuthenticated,
  },
  Mutation: {
    stats: isAuthenticated,
  },
});

export default permissions;
