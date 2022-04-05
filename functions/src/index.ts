import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
import * as express from "express";
import {
  ApolloServer,
  AuthenticationError,
  // ForbiddenError,
  gql,
} from "apollo-server-express";
import {
  addStats,
  getDocsFromQuerySnapshot,
  queryStatsByUserAndVideoId,
  setStats,
  verifyToken,
} from "./firebase";

const typeDefs = gql`
  type Stats {
    userId: ID
    videoId: ID
    likeDislike: LikeDislike
    watched: Boolean
  }
  enum LikeDislike {
    LIKE
    DISLIKE
    NONE
  }
  input StatsInput {
    userId: ID!
    videoId: ID!
    likeDislike: LikeDislike
    watched: Boolean
  }
  type Query {
    stats(input: StatsInput): Stats
  }
  type Mutation {
    stats(input: StatsInput): Stats
  }
`;

enum LikeDislike {
  like = "LIKE",
  dislike = "DISLIKE",
  none = "NONE",
}

type StatsInput = {
  userId: string;
  videoId: string;
  likeDislike: LikeDislike;
  watched: boolean;
};

const resolvers = {
  Query: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stats: async (_: any, { input }: { input: StatsInput }, context: any) => {
      if (!context.authenticated) {
        return new AuthenticationError(
          "Valid authentication token not provided."
        );
      }
      // TODO: Figure out how to do the check above for all resolvers without
      // having to repeat code

      const { userId, videoId } = input;

      const querySnapshot = await queryStatsByUserAndVideoId(userId, videoId);

      if (querySnapshot.size > 0) {
        const docs = getDocsFromQuerySnapshot(querySnapshot);
        console.log("got docs in index: ", { docs });
        return docs[0].data;
      }
      return null;
    },
  },
  Mutation: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stats: async (_: any, { input }: { input: StatsInput }, context: any) => {
      if (!context.authenticated) {
        return new AuthenticationError(
          "Valid authentication token not provided."
        );
      }

      console.log({ decoded: context.decodedToken });
      // TODO: Figure out how to do the check above for all resolvers without
      // having to repeat code

      const {
        userId,
        videoId,
        likeDislike = LikeDislike.none,
        watched = false,
      } = input;

      const querySnapshot = await queryStatsByUserAndVideoId(userId, videoId);
      console.log({ querySnapshot, size: querySnapshot.size });
      if (querySnapshot.size > 0) {
        const docs = getDocsFromQuerySnapshot(querySnapshot);
        const docId = docs[0].docId;
        const update = {
          ...docs[0].data,
          likeDislike,
          watched,
        };
        try {
          await setStats(docId, update);
          return update;
        } catch (error) {
          console.error((error as Error).message);
          return error;
        }
      }
      try {
        const newStats = {
          userId,
          videoId,
          likeDislike,
          watched,
        };
        await addStats(newStats);
        return newStats;
      } catch (error) {
        console.error((error as Error).message);
        return error;
      }
    },
  },
};

const authenticate: express.RequestHandler = async (req, res, next) => {
  const verifiedUser = await verifyToken(req.headers.authorization as string);
  if (verifiedUser) {
    res.locals.userId = verifiedUser.user_id;
    res.locals.authenticated = true;
    res.locals.decodedToken = verifiedUser;
  } else {
    res.locals.authenticated = false;
  }
  next();
  // try {
  //   const user = await admin
  //     .auth()
  //     .verifyIdToken(req.headers.authorization as string);

  //   res.locals.userId = user.user_id;
  //   res.locals.authenticated = true;
  // } catch (error) {
  //   res.locals.authenticated = false;
  // } finally {
  //   next();
  // }
};

const app = express();
app.use(authenticate);
const server = new ApolloServer({
  typeDefs,
  resolvers,
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
