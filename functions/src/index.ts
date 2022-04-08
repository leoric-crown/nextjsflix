import * as functions from "firebase-functions";
import * as express from "express";
import { ApolloServer } from "apollo-server-express";
import { verifyToken } from "./firebase";
import { typeDefs, resolvers } from "./graphql";
import permissions from "./permissions";
import { applyMiddleware } from "graphql-middleware";
import { makeExecutableSchema } from "@graphql-tools/schema";

const authenticate: express.RequestHandler = async (req, res, next) => {
  const verifiedUser = await verifyToken(req.headers.authorization as string);
  if (verifiedUser) {
    console.log("User checks out");
    res.locals.userId = verifiedUser.user_id;
    res.locals.authenticated = true;
    res.locals.decodedToken = verifiedUser;
  } else {
    console.log("User does not check out");
    res.locals.authenticated = false;
  }
  next();
};

const app = express();
app.use(authenticate);

const server = new ApolloServer({
  schema: applyMiddleware(
    makeExecutableSchema({ typeDefs, resolvers }),
    permissions
  ),
  context: ({ res }) => ({
    userId: res.locals.userId,
    authenticated: res.locals.authenticated,
    decodedToken: res.locals.decodedToken,
  }),
});

server.start().then(() => {
  server.applyMiddleware({ app, path: "/", cors: true });
});

export const graphql = functions.https.onRequest(app);
