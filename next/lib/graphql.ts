import { gql } from "@apollo/client";
import { LikeDislikeState } from "./types";

export type GraphQLQueryInput = {
  videoId?: string;
  watched?: boolean;
  likeDislike?: LikeDislikeState[];
};

export const MyListQuery = gql`
  query MyListQuery($input: StatsQueryInput) {
    stats(input: $input) {
      id
      videoId
    }
  }
`;
export const MyListQueryInput: GraphQLQueryInput = {
  likeDislike: [LikeDislikeState.like],
};

export const WatchedQuery = gql`
  query WatchedQuery($input: StatsQueryInput) {
    stats(input: $input) {
      id
      watched
      videoId
    }
  }
`;
export const WatchedQueryInput: GraphQLQueryInput = {
  watched: true,
};

export const VideoLikeDislikeQuery = gql`
  query VideoLikeDislikeQuery($input: VideoStatsQueryInput) {
    video(input: $input) {
      id
      likeDislike
    }
  }
`;

export const VideoLikeDislikeMutation = gql`
  mutation VideoLikeDislikeMutation($input: StatsInput) {
    video(input: $input) {
      id
      likeDislike
    }
  }
`;

export const VideoProgressQuery = gql`
  query VideoProgressQuery($input: VideoStatsQueryInput) {
    video(input: $input) {
      id
      progress
      watched
    }
  }
`;

export const ProgressMutation = gql`
  mutation ProgressMutation($input: StatsInput) {
    video(input: $input) {
      id
      progress
    }
  }
`;

export const WatchedMutation = gql`
  mutation WatchedMutation($input: StatsInput) {
    video(input: $input) {
      id
      watched
    }
  }
`;
