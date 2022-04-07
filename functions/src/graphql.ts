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
    userId: ID!
    videoId: ID!
    likeDislike: LikeDislike
    watched: Boolean
    progress: Int
    timestamp: Int
  }
  input StatsInput {
    videoId: ID!
    likeDislike: LikeDislike
    watched: Boolean
    progress: Int
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
    value: Int
    operator: NumberQueryOperator
  }
  input StatsQueryInput {
    videoIds: [ID!]
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
      console.log("resolving video query", { input, context });
      const { videoId } = input;
      const { userId } = context;

      const querySnapshot = await queryStatsByUserAndVideoId(userId, videoId);

      if (querySnapshot.size > 0) {
        const docs = getDocsFromQuerySnapshot(querySnapshot);
        return docs[0].data as Stats;
      }
      return null;
    },
    stats: async (
      _: never,
      { input }: { input: StatsQueryInput },
      context: { userId: string }
    ) => {
      console.log("resolving stats query", { input, context });
      const { userId } = context;
      const querySnapshot = await queryStats(userId, input);
      console.log({ querySnapshot });

      if (querySnapshot.size > 0) {
        const docs = getDocsFromQuerySnapshot(querySnapshot);
        console.log("returning docs with length = ", docs.length);
        console.log({ docs });
        return docs.map((doc) => doc.data);
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
      console.log("resolving video mutation", { input, context });
      const {
        videoId,
        likeDislike = LikeDislike.none,
        watched = false,
        progress = 0,
      } = input;
      const { userId } = context;

      const querySnapshot = await queryStatsByUserAndVideoId(userId, videoId);
      if (querySnapshot.size > 0) {
        const docs = getDocsFromQuerySnapshot(querySnapshot);
        const docId = docs[0].docId;
        const update = {
          ...docs[0].data,
          likeDislike,
          watched,
          progress,
        } as Stats;
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
          progress,
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
