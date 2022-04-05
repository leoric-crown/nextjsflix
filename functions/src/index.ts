import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import { ApolloServer, gql } from "apollo-server-express";

const typeDefs = gql`
  type Hotdog {
    isKosher: Boolean
    location: String
    name: String
    style: String
    website: String
  }
  type Query {
    hotdogs: [Hotdog]
  }
`;

const resolvers = {
  Query: {
    hotdogs: async () => {
      const snapshot = await admin.firestore().collection("hotdogs").get();
      console.log({ snapshot });
      const docs = snapshot.docs.map((doc) => doc.data());
      console.log({ docs });
      return docs;
    },
  },
};

const authMiddleware: express.RequestHandler = async (req, res, next) => {
  console.log("Request Type", req.method);
  console.log(req.path);
  next();
};

admin.initializeApp();
const app = express();
app.use(authMiddleware);
const server = new ApolloServer({ typeDefs, resolvers });
server.start().then(() => {
  server.applyMiddleware({ app, path: "/", cors: true });
});

export const graphql = functions.https.onRequest(app);
