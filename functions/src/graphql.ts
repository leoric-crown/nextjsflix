import {
  addStats,
  getDocsFromQuerySnapshot,
  queryStatsByUserAndVideoId,
  setStats,
} from "./firebase";
import {
    AuthenticationError,
    // ForbiddenError,
    gql,
  } from "apollo-server-express";

export const typeDefs = gql`
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

export const resolvers = {
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
