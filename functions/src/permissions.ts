import { shield, rule } from "graphql-shield";

const isAuthenticated = rule()((parent, args, context) => {
  console.log("in isAuthenticated: ", context.authenticated);
  return context.authenticated;
});

const permissions = shield({
  Query: {
    video: isAuthenticated,
    stats: isAuthenticated,
  },
  Mutation: {
    video: isAuthenticated,
  },
});

export default permissions;
