import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import {
  ApolloServer,
  AuthenticationError,
  ForbiddenError,
  gql,
} from "apollo-server-express";

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

admin.initializeApp();
const firestore = admin.firestore();
const statsRef = firestore.collection("stats");

const queryStatsByUserAndVideoId = async (userId: string, videoId: string) => {
  const query = statsRef
    .where("userId", "==", userId)
    .where("videoId", "==", videoId);
  const querySnapshot = await query.get();
  return querySnapshot;
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
        let data = {};
        querySnapshot.forEach((doc) => (data = doc.data()));
        return data;
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
      // TODO: Figure out how to do the check above for all resolvers without
      // having to repeat code

      const {
        userId,
        videoId,
        likeDislike = LikeDislike.none,
        watched = false,
      } = input;

      const querySnapshot = await queryStatsByUserAndVideoId(userId, videoId);

      if (querySnapshot.size > 0) {
        let update = {};
        let docId = "";
        let authError = false;
        querySnapshot.forEach((doc) => {
          if (doc.data().userId !== context.userId) {
            authError = true;
          }
          docId = doc.id;
          update = {
            ...doc.data(),
            likeDislike,
            watched,
          };
        });

        if (authError) return new ForbiddenError("Insufficient permissions");
        // TODO: implement the above authorization check via Firestore Rules
        try {
          await statsRef.doc(docId).set(update);
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
        await statsRef.add(newStats);
        return newStats;
      } catch (error) {
        console.error((error as Error).message);
        return error;
      }
    },
  },
};

const authenticate: express.RequestHandler = async (req, res, next) => {
  try {
    const user = await admin
      .auth()
      .verifyIdToken(req.headers.authorization as string);
    res.locals.userId = user.user_id;
    res.locals.authenticated = true;
  } catch (error) {
    res.locals.authenticated = false;
  } finally {
    next();
  }
};

const app = express();
app.use(authenticate);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: ({ res }) => ({
    userId: res.locals.userId,
    authenticated: res.locals.authenticated,
  }),
});
server.start().then(() => {
  server.applyMiddleware({ app, path: "/", cors: true });
});

export const graphql = functions.https.onRequest(app);
