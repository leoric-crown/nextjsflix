import {
  addStats,
  getDocsFromQuerySnapshot,
  queryStats,
  queryStatsByUserAndVideoId,
  setStats,
} from "./firebase";
import { gql } from "apollo-server-express";
import {
  LikeDislike,
  VideoStatsQueryInput,
  StatsQueryInput,
  Stats,
  StatsInput,
} from "./types";

export const typeDefs = gql`
  enum LikeDislike {
    LIKE
    DISLIKE
    NONE
  }
  type Stats {
    id: ID!
    userId: ID!
    videoId: ID!
    likeDislike: LikeDislike
    watched: Boolean
    progress: Float
    timestamp: Float
  }
  input StatsInput {
    videoId: ID!
    likeDislike: LikeDislike
    watched: Boolean
    progress: Float
  }
  input VideoStatsQueryInput {
    videoId: ID
  }
  enum NumberQueryOperator {
    LESS
    LESSEQ
    EQUAL
    NOTEQUAL
    GREATEQ
    GREAT
  }
  input NumberQuery {
    value: Float
    operator: NumberQueryOperator
  }
  input StatsQueryInput {
    likeDislike: [LikeDislike]
    watched: Boolean
    progress: NumberQuery
  }
  type Query {
    video(input: VideoStatsQueryInput): Stats
    stats(input: StatsQueryInput): [Stats]
  }
  type Mutation {
    video(input: StatsInput): Stats
  }
`;

export const resolvers = {
  Query: {
    video: async (
      _: never,
      { input }: { input: VideoStatsQueryInput },
      context: { userId: string }
    ) => {
      console.log("Resolving video query", { input, context });
      const { videoId } = input;
      const { userId } = context;

      const querySnapshot = await queryStatsByUserAndVideoId(userId, videoId);

      if (querySnapshot.size > 0) {
        const docs = getDocsFromQuerySnapshot(querySnapshot);
        return { id: docs[0].id, ...docs[0].data } as Stats;
      }
      return null;
    },
    stats: async (
      _: never,
      { input }: { input: StatsQueryInput },
      context: { userId: string }
    ) => {
      console.log("Resolving stats query", { input, context });
      const { userId } = context;
      const querySnapshot = await queryStats(userId, input);

      if (querySnapshot.size > 0) {
        const docs = getDocsFromQuerySnapshot(querySnapshot);
        return docs.map((doc) => ({ id: doc.id, ...doc.data }));
      }
      return [];
    },
  },
  Mutation: {
    video: async (
      _: never,
      { input }: { input: StatsInput },
      context: { userId: string }
    ) => {
      console.log("Resolving video mutation", { input });
      const { videoId, ...fields } = input;
      const { userId } = context;

      const querySnapshot = await queryStatsByUserAndVideoId(userId, videoId);
      if (querySnapshot.size > 0) {
        const docs = getDocsFromQuerySnapshot(querySnapshot);
        const docId = docs[0].id;

        const update = {
          ...docs[0].data,
          ...fields,
        };
        try {
          await setStats(docId, update);
          return { id: docId, ...update };
        } catch (error) {
          console.error((error as Error).message);
          return error;
        }
      }
      try {
        const newStats = {
          userId,
          videoId,
          likeDislike: LikeDislike.none,
          watched: false,
          progress: 0,
          ...fields,
        };
        const newDoc = await addStats(newStats);
        return { id: newDoc.id, ...newStats };
      } catch (error) {
        console.error((error as Error).message);
        return error;
      }
    },
  },
};
